import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSceneInteraction } from './useSceneInteraction';

/**
 * PRICING SCENE — "Cash Bundle Rain"
 *
 * Bundles of green cash fall continuously through empty space.
 * No floor, no stacks, no background — just money raining down.
 * Each bundle tumbles freely and loops back to the top when it exits the bottom.
 *
 * Interactions:
 *  - Drag to rotate the rain
 *  - Scroll to zoom
 *  - Click a bundle → it flashes bright and shoots upward briefly
 */
const PricingScene: React.FC = () => {
  const mountRef  = useRef<HTMLDivElement>(null);
  const groupRef  = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rayRef    = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const clickables = useRef<THREE.Object3D[]>([]);

  const { applyToGroup } = useSceneInteraction(
    mountRef,
    groupRef as React.RefObject<THREE.Group | null>,
    cameraRef.current,
    rayRef.current,
    clickables.current,
    {
      zoomMin: 4,
      zoomMax: 16,
      dragSensitivity: 0.009,
      parallaxStrength: 0.16,
      onMeshClick: (obj) => {
        // Flash the clicked bundle upward
        const parent = obj.parent;
        if (parent) {
          parent.userData.flashing = true;
          parent.userData.flashT   = 0;
        }
      },
    }
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);   // fully transparent background
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 60);
    camera.position.set(0, 0, 11);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // ── Lights ───────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const keyLight = new THREE.PointLight(0x4ade80, 6, 24);
    keyLight.position.set(3, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x22c55e, 3, 18);
    fillLight.position.set(-5, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x86efac, 2, 14);
    rimLight.position.set(0, -4, -3);
    scene.add(rimLight);

    // ── Group ────────────────────────────────────────────────────────────────
    const group = new THREE.Group();
    scene.add(group);
    (groupRef as React.MutableRefObject<THREE.Group>).current = group;

    // ── Bundle geometry (shared) ──────────────────────────────────────────────
    const wadGeo  = new THREE.BoxGeometry(0.72, 0.42, 0.46);
    const bandGeo = new THREE.BoxGeometry(0.74, 0.10, 0.48);

    // ── Build one bundle group ────────────────────────────────────────────────
    const makeBundle = (): THREE.Group => {
      const shade   = 0.45 + Math.random() * 0.55;
      const billCol = new THREE.Color(0, shade * 0.72, shade * 0.32);
      const bandCol = new THREE.Color(0.85, 0.72, 0.08);

      const bg = new THREE.Group();

      // Wad of bills
      const wadMat = new THREE.MeshPhongMaterial({
        color: billCol,
        emissive: billCol,
        emissiveIntensity: 0.3,
        shininess: 65,
      });
      const wad = new THREE.Mesh(wadGeo, wadMat);
      bg.add(wad);
      clickables.current.push(wad);

      // Stacked-edge lines on front and back faces
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(0, shade * 0.45, shade * 0.2),
        transparent: true,
        opacity: 0.55,
      });
      for (let l = -3; l <= 3; l++) {
        const pts1 = [
          new THREE.Vector3(-0.36, l * 0.06, 0.24),
          new THREE.Vector3( 0.36, l * 0.06, 0.24),
        ];
        const pts2 = [
          new THREE.Vector3(-0.36, l * 0.06, -0.24),
          new THREE.Vector3( 0.36, l * 0.06, -0.24),
        ];
        bg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts1), edgeMat));
        bg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2), edgeMat));
      }

      // Paper band
      const bandMat = new THREE.MeshPhongMaterial({
        color: bandCol,
        emissive: bandCol,
        emissiveIntensity: 0.35,
        shininess: 100,
      });
      bg.add(new THREE.Mesh(bandGeo, bandMat));

      // "$" emboss cylinder on band
      const emboss = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.49, 10),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.6 })
      );
      emboss.rotation.x = Math.PI / 2;
      bg.add(emboss);

      return bg;
    };

    // ── Spawn bundles spread across the visible volume ────────────────────────
    const BUNDLE_COUNT = 36;
    const TOP_Y        =  9;   // spawn above camera view
    const BOTTOM_Y     = -9;   // recycle below camera view
    const SPREAD_X     = 10;
    const SPREAD_Z     =  6;

    interface BundleData {
      group: THREE.Group;
      x: number;
      z: number;
      y: number;
      vy: number;
      rx: number;
      ry: number;
      rz: number;
    }

    const bundles: BundleData[] = [];

    for (let i = 0; i < BUNDLE_COUNT; i++) {
      const bg = makeBundle();

      const x = (Math.random() - 0.5) * SPREAD_X;
      const z = (Math.random() - 0.5) * SPREAD_Z;
      // Stagger initial Y so they don't all appear at once
      const y = BOTTOM_Y + Math.random() * (TOP_Y - BOTTOM_Y);

      bg.position.set(x, y, z);
      bg.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      group.add(bg);

      bundles.push({
        group: bg,
        x, z, y,
        vy: -(0.035 + Math.random() * 0.045),
        rx: (Math.random() - 0.5) * 0.065,
        ry: (Math.random() - 0.5) * 0.05,
        rz: (Math.random() - 0.5) * 0.055,
      });
    }

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();
    let autoRotY = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      autoRotY += 0.001;

      bundles.forEach(bd => {
        // Flash / shoot-up on click
        if (bd.group.userData.flashing) {
          bd.group.userData.flashT = (bd.group.userData.flashT ?? 0) + 0.06;
          const ft = bd.group.userData.flashT as number;
          // Shoot upward then fade back to normal fall
          bd.y += 0.12 * Math.max(0, 1 - ft);
          // Brighten wad emissive
          const wad = bd.group.children[0] as THREE.Mesh;
          const mat = wad.material as THREE.MeshPhongMaterial;
          mat.emissiveIntensity = 0.3 + (1 - Math.min(ft, 1)) * 1.2;
          if (ft >= 1.2) {
            bd.group.userData.flashing = false;
            mat.emissiveIntensity = 0.3;
          }
        }

        // Fall
        bd.y += bd.vy;

        // Tumble
        bd.group.rotation.x += bd.rx;
        bd.group.rotation.y += bd.ry;
        bd.group.rotation.z += bd.rz;

        // Recycle: when bundle exits bottom, reset to top with new random X/Z
        if (bd.y < BOTTOM_Y) {
          bd.y  = TOP_Y + Math.random() * 3;
          bd.x  = (Math.random() - 0.5) * SPREAD_X;
          bd.z  = (Math.random() - 0.5) * SPREAD_Z;
          bd.vy = -(0.035 + Math.random() * 0.045);
          bd.group.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          );
        }

        bd.group.position.set(bd.x, bd.y, bd.z);
      });

      // Lights orbit slowly
      keyLight.position.x  = Math.cos(t * 0.25) * 5;
      keyLight.position.z  = Math.sin(t * 0.25) * 5;
      fillLight.position.x = Math.cos(t * 0.2 + Math.PI) * 5;
      fillLight.position.z = Math.sin(t * 0.2 + Math.PI) * 5;

      applyToGroup(autoRotY);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      aria-hidden="true"
    />
  );
};

export default PricingScene;
