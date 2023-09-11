import {
	Vector2
} from 'three';

const CustomPass = {

	name: 'CustomPass',

	uniforms: {

		'tDiffuse': { value: null },
		'scale': { value: 1.0 },
		'time': { value: 0 },
		'progress': { value: 0 },
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float time;
		uniform float progress;
		uniform float scale;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec2 newUv = vUv;

			vec2 p = 2.*vUv - vec2(1.);

			p+= 0.1*cos(scale * 3. * p.yx + time + vec2(1.2, 3.4));
			p+= 0.1*cos(scale * 3.7 * p.yx + 1.4 * time + vec2(2.2, 3.4));
			p+= 0.1*cos(scale * 5. * p.yx + 2.6 * time + vec2(4.2, 1.4));
			p+= 0.3*cos(scale * 7. * p.yx + 3.6 * time + vec2(10.2, 3.4));


			newUv.x = mix(vUv.x, length(p), progress);
			newUv.y = mix(vUv.y, 0.5, progress);

			vec4 color = texture2D( tDiffuse, newUv );
			
			gl_FragColor = color;
			// gl_FragColor = vec4(length(p), 0., 0., 1.);

		}`

};

export { CustomPass };
