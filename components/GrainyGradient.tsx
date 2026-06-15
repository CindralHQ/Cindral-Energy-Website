'use client';

import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  
  varying vec2 v_uv;
  
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_speed;
  uniform float u_blobSize;
  uniform float u_softness;
  uniform float u_complexity;
  uniform int u_grainStyle;
  uniform float u_grainIntensity;
  uniform float u_halftoneSize;
  
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,   // (3.0-sqrt(3.0))/6.0
      0.366025403784439,   // 0.5*(sqrt(3.0)-1.0)
      -0.577350269189626,  // -1.0 + 2.0 * C.x
      0.024390243902439    // 1.0 / 41.0
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  float fbm(vec2 p, float time, float complexity) {
    float value = 0.0;
    float amplitude = 0.6;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      if (float(i) >= complexity) break;
      value += amplitude * snoise(p * frequency + time * 0.05);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  
  float filmGrain(vec2 uv, float time) {
    return hash(uv * u_resolution + fract(time * 100.0)) - 0.5;
  }
  
  float bayerMatrix(vec2 uv) {
    vec2 pixel = floor(mod(uv * u_resolution, 4.0));
    int x = int(pixel.x);
    int y = int(pixel.y);
    float pattern[16];
    pattern[0] = 0.0;    pattern[1] = 8.0;    pattern[2] = 2.0;    pattern[3] = 10.0;
    pattern[4] = 12.0;   pattern[5] = 4.0;    pattern[6] = 14.0;   pattern[7] = 6.0;
    pattern[8] = 3.0;    pattern[9] = 11.0;   pattern[10] = 1.0;   pattern[11] = 9.0;
    pattern[12] = 15.0;  pattern[13] = 7.0;   pattern[14] = 13.0;  pattern[15] = 5.0;
    int index = y * 4 + x;
    float value = 0.0;
    for (int i = 0; i < 16; i++) {
      if (i == index) value = pattern[i];
    }
    return (value / 16.0) - 0.5;
  }
  
  float halftone(vec2 uv, float luminance) {
    float dotSize = u_halftoneSize;
    vec2 pixel = uv * u_resolution;
    vec2 cell = floor(pixel / dotSize);
    vec2 cellCenter = (cell + 0.5) * dotSize;
    float dist = length(pixel - cellCenter);
    float maxRadius = dotSize * 0.5;
    float radius = maxRadius * (1.0 - luminance);
    return (dist < radius) ? -0.3 : 0.1;
  }
  
  float luminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }
  
  void main() {
    vec2 uv = v_uv;
    float time = u_time * u_speed;
    
    vec2 aspectUv = uv;
    aspectUv.x *= u_resolution.x / u_resolution.y;
    
    vec2 noiseCoord = aspectUv * u_blobSize;
    
    float n1 = fbm(noiseCoord + vec2(0.0, 0.0) + time * vec2(0.15, 0.1), time, u_complexity);
    float n2 = fbm(noiseCoord + vec2(3.7, 1.2) + time * vec2(-0.1, 0.12), time, u_complexity);
    float n3 = fbm(noiseCoord + vec2(1.4, 4.3) + time * vec2(0.08, -0.11), time, u_complexity);
    
    float edge = u_softness;
    float w1 = smoothstep(-edge, edge, n1);
    float w2 = smoothstep(-edge, edge, n2);
    float w3 = smoothstep(-edge, edge, n3);
    
    w1 = max(w1, 0.1);
    w2 = max(w2, 0.1);
    w3 = max(w3, 0.1);
    
    float total = w1 + w2 + w3;
    w1 /= total;
    w2 /= total;
    w3 /= total;
    
    vec3 color = u_color1 * w1 + u_color2 * w2 + u_color3 * w3;
    
    float grain = 0.0;
    if (u_grainStyle == 0) {
      grain = filmGrain(uv, u_time);
    } else if (u_grainStyle == 1) {
      grain = bayerMatrix(uv);
    } else if (u_grainStyle == 2) {
      grain = halftone(uv, luminance(color));
    }
    
    color += grain * u_grainIntensity;
    color = clamp(color, 0.0, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vShader: WebGLShader, fShader: WebGLShader) {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255.0,
    parseInt(result[2], 16) / 255.0,
    parseInt(result[3], 16) / 255.0
  ] : [0, 0, 0];
}

interface GrainyGradientProps {
  className?: string;
  color1?: string;
  color2?: string;
  color3?: string;
}

export function GrainyGradient({
  className = '',
  color1 = '#008744', 
  color2 = '#1E2922', 
  color3 = '#2BB62F'
}: GrainyGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = createProgram(gl, vs, fs);
    if (!program) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    
    const uniforms = {
      time: gl.getUniformLocation(program, 'u_time'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      color1: gl.getUniformLocation(program, 'u_color1'),
      color2: gl.getUniformLocation(program, 'u_color2'),
      color3: gl.getUniformLocation(program, 'u_color3'),
      speed: gl.getUniformLocation(program, 'u_speed'),
      blobSize: gl.getUniformLocation(program, 'u_blobSize'),
      softness: gl.getUniformLocation(program, 'u_softness'),
      complexity: gl.getUniformLocation(program, 'u_complexity'),
      grainStyle: gl.getUniformLocation(program, 'u_grainStyle'),
      grainIntensity: gl.getUniformLocation(program, 'u_grainIntensity'),
      halftoneSize: gl.getUniformLocation(program, 'u_halftoneSize'),
    };

    let animationId: number;
    let startTime = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      const time = (performance.now() - startTime) / 1000;
      
      gl.useProgram(program);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.uniform1f(uniforms.time, time);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      
      gl.uniform3fv(uniforms.color1, hexToRgb(color1));
      gl.uniform3fv(uniforms.color2, hexToRgb(color2));
      gl.uniform3fv(uniforms.color3, hexToRgb(color3));
      
      gl.uniform1f(uniforms.speed, 0.35);
      gl.uniform1f(uniforms.blobSize, 0.8);
      gl.uniform1f(uniforms.softness, 0.5);
      gl.uniform1f(uniforms.complexity, 2);
      gl.uniform1i(uniforms.grainStyle, 0);
      gl.uniform1f(uniforms.grainIntensity, 0.0);
      gl.uniform1f(uniforms.halftoneSize, 4.0);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      animationId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [color1, color2, color3]);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} />;
}
