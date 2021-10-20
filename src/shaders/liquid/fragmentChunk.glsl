    vec2 st = vUv * uScale;

    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm( st + 0.1 * uTime * uSpeed.x);
    q.y = fbm( st + 0.1 * uTime * uSpeed.x);

    vec2 r = vec2(0.);
    r.x = fbm( st + uRotation.x * q + uTime * uSpeed.y);
    r.y = fbm( st + uRotation.y * q + uTime * uSpeed.y);

    float f = fbm(r + st);

    color = mix(uColor1a, //vec3(0.9,0.0,0.0),
                uColor1b, //vec3(0.5,0.0,0.9),
                clamp(f,0.0,1.0));

    color = mix(color,
                uColor2,//vec3(0,0,0.9),
                clamp(length(q),0.0,1.0));

    color = mix(color,
                uColor3,//vec3(0,0.7,0.3),
                clamp(length(r),0.0,1.0));

    vec4 diffuseColor = vec4((uDegreeWeights.x*f*f + uDegreeWeights.y*f*f+ uDegreeWeights.z*f)*color,1.);