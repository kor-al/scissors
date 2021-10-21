    vec2 st = vUv * uScale;

    float t = uTime*uSpeed;

    //st = cos(st* t*0.1) + st;
    vec3 color = vec3(0.);

    // Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1.;  // minimum distance
    for (int j= -1; j <= 1; j++ ) {
        for (int i= -1; i <= 1; i++ ) {
            // Neighbor place in the grid
            vec2 neighbor = vec2(float(i),float(j));

            // Random position from current + neighbor place in the grid
            vec2 offset = random2(i_st + neighbor);

            // Animate the offset
            offset = 0.5 + 0.5*sin(t + 6.2831*offset);

            // Position of the cell
            vec2 pos = neighbor + offset - f_st;

            // Cell distance
            float dist = sqrt(length(pos));

            // Metaball it!
            m_dist = min(m_dist, m_dist*dist);
        }
    }
    
    //m_dist = step(0.9, m_dist);

    // Draw cells
    //color += step(0.1, m_dist);
    //color.r += m_dist;
    //color += 1.0 - step(0.05, m_dist);
    //color = 1.-color;

    float inversion = (1.-step(uStepThreshold.x, m_dist));
    float mask = step(uStepThreshold.y, m_dist);
    
    color += inversion * mix(uColorInvertion1,uColorInvertion2,m_dist);
    color += mask * mix(uColor1,uColor2,m_dist);
    //color +=  mix(vec3(1.000,0.888,0.036),vec3(0.446,0.015,0.800),m_dist);
    
    float pct = abs(sin(uTime*uSpeed));
    vec3 tintColor = vec3(0.0);
    tintColor = mix(uTintColorFrom, uTintColorTo, pct);
    color =  mix(color,tintColor,m_dist);

    vec4 diffuseColor = vec4(color,1.);