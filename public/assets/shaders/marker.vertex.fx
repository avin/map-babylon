/**
 * Author: EPK Technologies s.r.o. (http://www.epk-technologies.com)
 * Copyright 2015 EPK Technologies s.r.o. (http://www.epk-technologies.com)
 */

precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 worldViewProjection;

varying vec2 vUv;

void main()
{
    vec4 p = vec4(position, 1.0);
    vUv = uv;
    gl_Position = worldViewProjection * p;
}