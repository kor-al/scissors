//Based on Metaballs shader by @patriciogv - 2015
// From the Book of Shaders


uniform float uTime;
uniform float uScale;

varying vec2 vUv;


vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}


void main() {
    vec2 st = vUv * uScale;
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
            offset = 0.5 + 0.5*sin(uTime + 6.2831*offset);

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
    
    color += (1.-step(0.3, m_dist))*mix(vec3(1.000,0.888,0.036),vec3(0.768,0.006,0.800),m_dist);
    color += (step(0.3, m_dist))*mix(vec3(1.000,0.846,0.686),vec3(0.800,0.576,0.385),m_dist);
    //color +=  mix(vec3(1.000,0.888,0.036),vec3(0.446,0.015,0.800),m_dist);
    color =  mix(color,vec3(0.655,0.653,0.800),m_dist);


    gl_FragColor = vec4(color,1.0);
}
