    vec3 color = vec3(0.0);
    vec2 st = vUv * uScale;
    float t = uSpeed * uTime/10.;
    //st = dot(sin(st + uTime), cos(st + uTime)) + exp(cos(st + uTime));
    //roses
    //st = dot(sin(st + t), 6.*cos(st + t)) + exp(cos(st + t));
    //st = dot(sin(st + uTime), 10.*sin(st+uTime)*cos(st + uTime)) + exp(cos(st + uTime));
    //crocodile
    //st = 6.*sin(st+uTime)*cos(st + uTime) + cos(st + uTime);
    //crocodile + roses
    st = dot(5.*sin(st + t), 2.*cos(st+ t)) * cos(st);
  
	vec2 F = cellular(st);
	float facets = uOffset+(F.y-F.x);
    //color = vec3(facets);

    //     color = mix(uColor1, uColor2, F.x);
    // color = mix(color, uColor3, length(F));

    color = mix(uColor1, uColor2, facets);
    color = mix(color, uColor3, F.x);
    color = mix(color, uColor4, length(F));

    //color = smoothstep(0.1,0.5,vec3(facets));
    vec4 diffuseColor = vec4(color,1.);