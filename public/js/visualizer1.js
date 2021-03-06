var vis1 = function(){
  var width = window.innerWidth;
  var height = window.innerHeight;

  // set some camera attributes
  var view_angle = 50;
  var aspect = width / height;
  var near = 1;
  var far = 10000;

  // get the DOM element to attach to
  var $container = $('#container1');

  // create a WebGL renderer, camera and a scene
  var renderer = new THREE.WebGLRenderer({alpha:true});
  var camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
  var scene = new THREE.Scene();
  renderer.domElement.id = "container1";

  // initialize
  var cubes = [];
  var controls;

  // setup the grid with 8 rows with 16 columns cubes
  var row = 0;
  for(var x = -16; x < 48; x += 2) {
    var col = 0;
    cubes[row] = [];
    for(var y = 8; y < 24; y += 2) {
      var geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      var material = new THREE.MeshLambertMaterial({
        ambient: 0xe67e22,
        specular: 0x999999,
        shininess: 100,
        opacity:0.8,
        transparent: true
      });
      cubes[row][col] = new THREE.Mesh(geometry, material);
      cubes[row][col].position.x = x;
      cubes[row][col].position.y = y;
      cubes[row][col].position.z = 0;
      cubes[row][col].material.color.setHSL(0.0,0.8,0.8);
      scene.add(cubes[row][col]);
      col++;
    }
    row++;
  }

  // create lighting
  var light = new THREE.AmbientLight(0x505050);
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(0, 1, 1);
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(1, 1, 0);
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(0, -1, -1);
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(-1, -1, 0);
  scene.add(light);

  // set the camera position
  camera.position.z = 50;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  // controls.addEventListener('change', render);

  for(var i = 0; i < 7; i++) {
    controls.pan(new THREE.Vector3( 1, 0, 0 ));
    controls.pan(new THREE.Vector3( 0, 1, 0 ));
  }

  // Makes the cubes change shape and color
  var updateCubes = function(){
    // reloads the fft data
    AudioManager().analyser.getByteFrequencyData(dataArray);
    AudioManager().analyser.getByteTimeDomainData(timeDomain);

    // check if the dataArray (audio buffer) is empty
    var zeros = Array.prototype.slice.call(dataArray);

    zeros = zeros.reduce(function(a, b){ return a + b; });

    // don't do anything to the cubes if the dataArray is empty
    if(typeof dataArray === 'object' && dataArray.length > 0 && zeros > 0) {
      var z = 0;
      var offset = 1;
      for(var row = 16, rowLength = cubes.length; row < rowLength; row++) {
        for(var col = 0, colLength = cubes[row].length; col < colLength; col++) {
          var scale = (dataArray[z] / 10 < 1) ? 1 : dataArray[z] / 10;
          var data = dataArray[z] / 255;
          var rowShift = row - offset;

          // right side
          cubes[row][col].material.color.setHSL(data, 0.8, 0.5);
          cubes[row][col].scale.z = scale;
          cubes[row][col].material.opacity = data * 10;

          // left side
          cubes[rowShift][col].material.color.setHSL(Math.abs(data - 1), 0.8, 0.5);
          cubes[rowShift][col].scale.z = scale;
          cubes[rowShift][col].material.opacity = data * 10;
          z++;
        }
        offset += 2;
      }
    }
  };

  // Updates the visualizer
  var render = function () {
    if(vis1IsOn){
      updateCubes();
      controls.update();
      renderer.render(scene, camera);

      // invokes render again
      requestAnimationFrame(render);
    }
  };

  if(vis1IsOn){
    // start the renderer
    renderer.setSize(width, height);

    // and make it pretty
    renderer.setClearColor(0xffffff, 0.7);
    renderer.clear();
    render();
    // attach the render-supplied DOM element
    if($container.children().length < 1){
      $container.append(renderer.domElement);
    }
  }
}
vis1();