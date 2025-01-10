precision mediump float;
uniform vec2 resolution;
uniform sampler2D textureUnit;
uniform vec2 texSize;
uniform vec2 texPos;
varying vec2 vTexCoord;

void main() {
  vec2 p = (gl_FragCoord.xy / resolution) * 2. - 1.;
  vec3 color = vec3(0., step(0.7, abs(p.x)), 0.);

  vec2 uv = (vTexCoord - texPos) * texSize + vec2(0.5);
  uv.y = 1. - uv.y;
  float inBounds = all(greaterThanEqual(uv, vec2(0.0))) && all(lessThanEqual(uv, vec2(1.0))) ? 1.0 : 0.0;
  vec4 samplerColor = texture2D(textureUnit, uv);
  samplerColor.rgb *= inBounds;

  gl_FragColor = vec4(color, 1.) + samplerColor;
}