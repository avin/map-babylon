/**
 * Author: EPK Technologies s.r.o. (http://www.epk-technologies.com)
 * Copyright 2015 EPK Technologies s.r.o. (http://www.epk-technologies.com)
 */

precision mediump float;

uniform float highlight;

uniform sampler2D tex;

varying vec2 vUv;

void main()
{
    gl_FragColor = texture2D(tex, vUv);// + vec4(0.1, 0.4, 0.8, 0.0) * highlight;
}