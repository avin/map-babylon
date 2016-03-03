/**
 * Author: EPK Technologies s.r.o. (http://www.epk-technologies.com)
 * Copyright 2015 EPK Technologies s.r.o. (http://www.epk-technologies.com)
 */

precision mediump float;

uniform float time;
uniform vec3 baseColor;
uniform float highlight;

varying vec2 vUv;

void main()
{
    float intensity = (abs(sin(vUv.x * 30.0 + time)) + abs(cos(vUv.x * 10.78 + time * 1.75)) + abs(sin(vUv.x * 15.11 - time * 2.3))) / 3.0;
    float mask = cos((vUv.y - 0.5) * 3.14) * cos((vUv.x - 0.5) * 3.14);
    gl_FragColor = vec4(baseColor * intensity, mask * intensity);

    if(highlight != 0.0){
        gl_FragColor += vec4(0.02, 0.39, 0.83, 1.0) * mask * max((sin(vUv.y * 5.0 - highlight * 3.0 - 4.0) - 0.95) * 32.0, 0.0);
    }
}