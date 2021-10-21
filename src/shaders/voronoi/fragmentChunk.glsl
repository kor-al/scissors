// Based on CellularNoise by @patriciogv
// From Te Book of Shaders


vec2 st = vUv * uScale;
vec3 color = vec3(0.);

// Tile the space
vec2 i_st = floor(st);
vec2 f_st = fract(st);

float m_dist = 1.;  // minimum distance

for (int y= -1; y <= 1; y++) {
    for (int x= -1; x <= 1; x++) {
    // Neighbor place in the grid
    vec2 neighbor = vec2(float(x),float(y));

    // Random position from current + neighbor place in the grid
    vec2 point = random2(i_st + neighbor);

                // Animate the point
    point = 0.5 + 0.5*sin(uTime*uSpeed + uRandomFactor*point);

                // Vector between the pixel and the point
    vec2 diff = neighbor + point - f_st;

    // Distance to the point
    float dist = length(diff);

    // Keep the closer distance
    m_dist = min(m_dist, dist);
    }
}

// Draw the min distance (distance field)
color += m_dist;

// Draw cell center
//color += 1.-step(.02, m_dist);

// Draw grid
//color.r += step(.98, f_st.x) + step(.98, f_st.y);
color = mix(uColor1, uColor2,m_dist);

vec4 diffuseColor =  vec4(color, 1.0);