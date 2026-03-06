import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas, alpha: true } );

	const fov = 60;
	const aspect = 2; 
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( -5, 2, 37 );

	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 10, -20 );
	controls.update();

	const scene = new THREE.Scene();
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	const fishList = [];
	let caughtCount = 0;
	const totalFish = 8;
    
	{
        const planeSize = 1000; 

        const loader = new THREE.TextureLoader();
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = () => {
            document.querySelector('#loading').style.display = 'none';
        };
        loadingManager.onProgress = (url, loaded, total) => {
            console.log(`Loading: ${loaded}/${total}`);
        };
        const texture = loader.load('sand.jpeg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.repeat.set(20, 20);
	
		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		mesh.position.y = -5;
		scene.add( mesh );

	}

	{
		const width = 10;
		const length = 10;
		const height = 30;
		const cubeGeo = new THREE.BoxGeometry( length, height, width );
		const positionAttribute = cubeGeo.getAttribute('position');
		const colors = [];

		const colorBottom = new THREE.Color('#b4b4b4'); 
		const colorTop = new THREE.Color('#515b57');    

		for (let i = 0; i < positionAttribute.count; i++) {
			const y = positionAttribute.getY(i);       
			const t = (y + 5) / 10;                    
			
			const color = colorBottom.clone().lerp(colorTop, t);
			colors.push(color.r, color.g, color.b);
		}

		cubeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		const cubeMat = new THREE.MeshPhongMaterial({
			vertexColors: true, 
			shininess: 80,
		});

		const height2= 40;
		const cubeGeo2 = new THREE.BoxGeometry( length, height2, width );
		const cubeMat2 = new THREE.MeshPhongMaterial( { color: '#8AC' } );

		const width2 = 5;
		const length2 = 5;
		const cubeGeo3 = new THREE.BoxGeometry( length2, height2, width2 );
		const cubeMat3 = new THREE.MeshPhongMaterial( { color: '#999999' } );

		const cubeGeo4 = new THREE.BoxGeometry( 7, 10, 5 );
		const cubeMat4 = new THREE.MeshPhongMaterial( { color: '#ce7e00' } );

		const c1 = new THREE.Mesh( cubeGeo, cubeMat );
		c1.position.set( 10, 10, -30 );
		c1.rotation.y = -0;
		c1.rotation.z = 0.05;
		c1.rotation.x = 0.1;
		scene.add( c1 );

		const c2 = new THREE.Mesh( cubeGeo, cubeMat );
		c2.position.set( 40, 10, -30 );
		c2.rotation.y = -0;
		c2.rotation.z = 0.05;
		c2.rotation.x = 0.1;
		scene.add( c2 );

		const c3 = new THREE.Mesh( cubeGeo2, cubeMat2);
		c3.position.set( 24, 25, -28.5 );
		c3.rotation.y = -0;
		c3.rotation.z = 1.6;
		c3.rotation.x = 0.1;
		scene.add( c3 );

		const c4 = new THREE.Mesh( cubeGeo3, cubeMat3);
		c4.position.set( 24, 22, -24 );
		c4.rotation.y = -0;
		c4.rotation.z = 1.6;
		c4.rotation.x = 0.1;
		scene.add( c4 );

		const c5 = new THREE.Mesh( cubeGeo4, cubeMat4);
		c5.position.set( 20, -3, -5 );
		c5.rotation.y = -0.2;
		c5.rotation.z = 1.7;
		c5.rotation.x = 0.2;
		scene.add( c5 );

	}

	{
		const halfSphereGeo = new THREE.SphereGeometry(
			3.5,     
			32,   
			16,     
			0,        
			Math.PI * 2,
			0,         
			Math.PI / 2 
		);
		const halfSphereMat = new THREE.MeshPhongMaterial({ color: '#999999' });
		const s1 = new THREE.Mesh(halfSphereGeo, halfSphereMat);
		s1.position.set(9, 19, -25);
		s1.rotation.z = Math.PI;
		scene.add(s1);

		const s2 = new THREE.Mesh(halfSphereGeo, halfSphereMat);
		s2.position.set(40, 20, -25);
		s2.rotation.z = Math.PI;
		scene.add(s2);

		
		const loader = new THREE.TextureLoader();
		const texture = loader.load('coral.jpg');
		texture.colorSpace = THREE.SRGBColorSpace;

		const geometry = new THREE.SphereGeometry(8, 32, 32); 
		const material = new THREE.MeshPhongMaterial({
			map: texture,
			shininess: 100
		});
		const sphere = new THREE.Mesh(geometry, material);
		sphere.position.set(-10, -5, -20);
		scene.add(sphere);

		const texture2 = loader.load('coral2.jpg');
		texture2.colorSpace = THREE.SRGBColorSpace;

		const geometry2 = new THREE.SphereGeometry(10, 32, 32); 
		const material2 = new THREE.MeshPhongMaterial({
			map: texture2,
			shininess: 100,
		});

		const sphere2 = new THREE.Mesh(geometry2, material2);
		sphere2.position.set(-25, -3, -20);
		scene.add(sphere2);

		const texture3 = loader.load('gold.avif');
		texture3.colorSpace = THREE.SRGBColorSpace;

		const geometry3 = new THREE.SphereGeometry(1.5, 6, 5); 
		const material3 = new THREE.MeshPhongMaterial({
			map: texture3,
			shininess: 100,
		});

		const s3 = new THREE.Mesh( geometry3, material3);
		s3.position.set( 18, 0, -5 );
		s3.rotation.y = -0.2;
		s3.rotation.z = 1.7;
		s3.rotation.x = 0.2;
		scene.add( s3 );

		const s4 = new THREE.Mesh( geometry3, material3);
		s4.position.set( 20, 0, -5 );
		s4.rotation.y = -0.2;
		s4.rotation.z = 1.7;
		s4.rotation.x = 0.2;
		scene.add( s4 );

		const s5 = new THREE.Mesh( geometry3, material3);
		s5.position.set( 22, 0, -5 );
		s5.rotation.y = -0.2;
		s5.rotation.z = 1.7;
		s5.rotation.x = 0.2;
		scene.add( s5 );

		const s6 = new THREE.Mesh( geometry3, material3);
		s6.position.set( 23, 1, -4 );
		s6.rotation.y = -0.2;
		s6.rotation.z = 1.7;
		s6.rotation.x = 0.2;
		scene.add( s6 );

		const s7 = new THREE.Mesh( geometry3, material3);
		s7.position.set( 21, 0.5, -4 );
		s7.rotation.y = -0.2;
		s7.rotation.z = 1.7;
		s7.rotation.x = 0.2;
		scene.add( s7 );	

	}
	let lidPivot = new THREE.Object3D();

	{
		const cylinderGeo = new THREE.CylinderGeometry(2, 2, 25, 32);
		
		const positionAttribute = cylinderGeo.getAttribute('position');
		const colors = [];

		const colorBottom = new THREE.Color('#aacccc'); 
		const colorTop = new THREE.Color('#b4b4b4');    

		for (let i = 0; i < positionAttribute.count; i++) {
			const y = positionAttribute.getY(i);    
			const t = (y + 5) / 10;                    
			
			const color = colorBottom.clone().lerp(colorTop, t); 
			colors.push(color.r, color.g, color.b);
		}

		cylinderGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		const cylinderMat = new THREE.MeshPhongMaterial({
			vertexColors: true,
			shininess: 80,
		});

		const cyl1 = new THREE.Mesh( cylinderGeo, cylinderMat );
		cyl1.position.set(9.5, 6, -26);
		cyl1.rotation.x = 0.1;
		cyl1.rotation.z = 0.05;
		scene.add( cyl1 );

		const cyl2 = new THREE.Mesh( cylinderGeo, cylinderMat );
		cyl2.position.set(40.5, 6, -26);
		cyl2.rotation.x = 0.1;
		cyl2.rotation.z = 0.05;
		scene.add( cyl2 );

		const loader = new THREE.TextureLoader();
		const texture = loader.load('coral3.jpg');
		texture.colorSpace = THREE.SRGBColorSpace;

		const geometry = new THREE.CylinderGeometry(5.5, 3, 60); 
		const material = new THREE.MeshPhongMaterial({
			map: texture,
			shininess: 100,
		});

		const texture2 = loader.load('coral4.jpg');
		texture2.colorSpace = THREE.SRGBColorSpace;

		const geometry2 = new THREE.CylinderGeometry(3.5, 2, 40); 
		const material2 = new THREE.MeshPhongMaterial({
			map: texture2,
			shininess: 100,
		});

		const texture3 = loader.load('coral5.jpg');
		texture3.colorSpace = THREE.SRGBColorSpace;

		const geometry3 = new THREE.CylinderGeometry(1.5, 0.8, 20); 
		const material3 = new THREE.MeshPhongMaterial({
			map: texture3,
			shininess: 100,
		});

		const cyl3 = new THREE.Mesh( geometry, material);
		cyl3.position.set(50, 10, -15);
		scene.add( cyl3 );

		const cyl4 = new THREE.Mesh( geometry2, material2);
		cyl4.position.set(45, 0, -10);
		cyl4.rotation.z = 0.3;
		scene.add( cyl4 );

		const cyl5 = new THREE.Mesh( geometry3, material3);
		cyl5.position.set(49, 0, -8);
		cyl5.rotation.z = -0.1;
		cyl5.rotation.x = 0.3;
		scene.add( cyl5 );

		const cyl6 = new THREE.Mesh( geometry3, material3);
		cyl6.position.set(-12, 0, -20);
		cyl6.rotation.z = -0.1;
		cyl6.rotation.x = 0.3;
		scene.add( cyl6 );


		const halfCylGeo = new THREE.CylinderGeometry(
			2.5,           
			2.5,          
			10,          
			32,          
			1,           
			false,       
			0,           
			Math.PI      
		);
		const halfCylMat = new THREE.MeshPhongMaterial({ color: '#ce7e00' });
		const halfCyl = new THREE.Mesh(halfCylGeo, halfCylMat);
		halfCyl.position.set( 19.6, 0, -4.5); 
		halfCyl.rotation.z = Math.PI/2;
		halfCyl.rotation.y = -0.2;
		halfCyl.rotation.z = 1.7;
		halfCyl.rotation.x = 0.2;
		scene.add(halfCyl);

		lidPivot.position.set(19.6, 0, -4.5); 
		scene.add(lidPivot);
		lidPivot.add(halfCyl);
		halfCyl.position.set(0, 0, 0);

	}
	

	const bubbles = [];
	const bubbleCount = 50;

	for (let i = 0; i < bubbleCount; i++) {
		const size = Math.random() * 0.75;
		const bubbleGeo = new THREE.SphereGeometry(size, 10, 10);
		const bubbleMat = new THREE.MeshPhongMaterial({
			color: 0xaaddff,
			transparent: true,
			opacity: 0.5,
			shininess: 100,
		});
		const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);

		bubble.position.set(
			(Math.random() - 0.5) * 50, 
			Math.random() * -5,       
			(Math.random() - 0.5) * 30 
		);

		bubble.userData.speed = Math.random() * 0.05 + 0.02;
		bubble.userData.wobble = Math.random() * Math.PI * 2; 

		scene.add(bubble);
		bubbles.push(bubble);
	}
	{
		const fishGeo = new THREE.ConeGeometry(0.5, 2, 8);
		fishGeo.rotateZ(-Math.PI / 2);
	
		const tailGeo = new THREE.ConeGeometry(0.4, 1, 8);
		tailGeo.rotateZ(Math.PI / 2);
	
		for (let i = 0; i < totalFish; i++) {
			const color = new THREE.Color().setHSL(Math.random(), 0.9, 0.6);
			const fishMat = new THREE.MeshPhongMaterial({ color });
	
			const fish = new THREE.Group();
	
			const body = new THREE.Mesh(fishGeo, fishMat);
			fish.add(body);
	
			const tail = new THREE.Mesh(tailGeo, fishMat);
			tail.position.x = -1.2;
			fish.add(tail);
	
			fish.position.set(
				-40,
				Math.random() * 10 - 3,
				Math.random() * 20 - 15
			);
			fish.userData.speed = Math.random() * 0.05 + 0.03;
			fish.userData.caught = false;
			fish.userData.wobble = Math.random() * Math.PI * 2;
			fish.userData.bodyMesh = body;
	
			scene.add(fish);
			fishList.push(fish);
		}
	}

	canvas.addEventListener('click', (event) => {
		const rect = canvas.getBoundingClientRect();
		mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
	
		raycaster.setFromCamera(mouse, camera);
	
		const meshesToCheck = fishList
			.filter(f => !f.userData.caught)
			.map(f => f.userData.bodyMesh);
	
		const intersects = raycaster.intersectObjects(meshesToCheck);
	
		if (intersects.length > 0) {
			const clickedMesh = intersects[0].object;
			const fish = fishList.find(f => f.userData.bodyMesh === clickedMesh);
			if (fish) {
				fish.userData.caught = true;
				scene.remove(fish);
				caughtCount++;
				document.querySelector('#score').textContent = `Fish Caught: ${caughtCount} / ${totalFish}`;
	
				if (caughtCount === totalFish) {
					document.querySelector('#win').style.display = 'block';
				}
			}
		}
	});
	


    //Hemisphere
    const skyColor = 0xB1E1FF;
    const groundColor = 0x455b53; 
    const intensity = 1.5;
    const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
    scene.add( light );

    //Directional
    const sunColor = 0xafd7ff;
    const sunIntensity = 1.0;
    const directionalLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    directionalLight.position.set(0, 50, 0);  
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    //Point
    const glowColor = 0x00ffcc;  
    const glowIntensity = 100;
    const glowDistance = 20;      
    const pointLight = new THREE.PointLight(glowColor, glowIntensity, glowDistance);
    pointLight.position.set(20, 2, -5); 
    scene.add(pointLight);



    const loader = new THREE.TextureLoader();
    const texture = loader.load('underwater.jpg', () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('anchor.glb', (gltf) => {
        const root = gltf.scene;
        root.scale.set(0.05, 0.05, 0.05);
        root.position.set(-15, -6, 5);
        scene.add(root);
    });


	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
		}
		return needResize;

	}

	function render(time) {
        time *= 0.001;
		bubbles.forEach((bubble) => {
			bubble.position.y += bubble.userData.speed;  
			bubble.position.x += Math.sin(time + bubble.userData.wobble) * 0.01;
	
			if (bubble.position.y > 100) {
				bubble.position.y = 0;
				bubble.position.x = (Math.random() - 0.5) * 40;
				bubble.position.z = (Math.random() - 0.5) * 20;
			}
		});
		const lidSpeed = 0.5;
		const maxAngle = Math.PI / 2.4; 
	
		lidPivot.rotation.x = 0.2 + (Math.max(0, Math.sin(time * lidSpeed)) * -(maxAngle));

		fishList.forEach((fish) => {
			if (fish.userData.caught) return;
		
			fish.position.x += fish.userData.speed*2;
			fish.position.y += Math.sin(time * 2 + fish.userData.wobble) * 0.01;
		
			fish.rotation.y = 0;
		
			if (fish.position.x > 60) {
				fish.position.x = -40;
				fish.position.y = Math.random() * 10 - 3;
				fish.position.z = Math.random() * 20 - 15;
			}
		});

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		renderer.render( scene, camera );
		requestAnimationFrame( render );
	}
	requestAnimationFrame( render );
}
main();