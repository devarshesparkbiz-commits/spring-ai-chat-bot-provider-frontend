import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSceneInteraction } from './useSceneInteraction';

/**
 * FEATURES SCENE — "Built for teams that move fast"
 *
 * Visual story:
 *  - A rocket launches upward from a launch pad, trailing fire particles
 *  - 4 small team-member avatar spheres orbit the rocket (the "team")
 *  - A circular progress ring fills up around the rocket (deployment progress)
 *  - Speed lines streak past in the background
 *  - A "LIVE" indicator pulses green at the top
 *
 * Interactions:
 *  - Drag to orbit
 *  - Scroll to zoom
 *  - Click the rocket → it boosts (accelerates upward, fire intensifies)
 *  - Click an avatar → it spins and emits a sparkle
 *  - Hover → tooltip
 */
const KnowledgeScene: React.FC = () => {
  const mountRef   = useRef<HTMLDivElement>(null);
  const groupRef   = useRef<THREE.Group>(null);
  const cameraRef  = useRef<THREE.PerspectiveCamera | null>(null);
  const rayRef     = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const clickables = useRef<THREE.Object3D[]>([]);

  const boostRef  = useRef(false);
  const boostT    = useRef(0);
  const avatarSparkIdx = useRef(-1);
  const avatarSparkT   = useRef(0);

  const { applyToGroup } = useSceneInteraction(
    mountRef,
    groupRef as React.RefObject<THREE.Group | null>,
    cameraRef.current,
    rayRef.current,
    clickables.current,
    {
      zoomMin: 3,
      zoomMax: 12,
      dragSensitivity: 0.009,
      parallaxStrength: 0.15,
      onMeshClick: (obj) => {
        if (obj.userData.isRocket) {
          boostRef.current = true;
          boostT.current   = 0;
        }
        if (obj.userData.avatarIdx !== undefined) {
          avatarSparkIdx.current = obj.userData.avatarIdx;
          avatarSparkT.current   = 0;
        }
      },
    }
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth, H = mount.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 60);
    camera.position.set(0, 0.5, 9);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pl1 = new THREE.PointLight(0x5865f2, 5, 18); pl1.position.set(-3, 4, 4); scene.add(pl1);
    const pl2 = new THREE.PointLight(0xf97316, 4, 14); pl2.position.set(2, -2, 3);  scene.add(pl2);
    const pl3 = new THREE.PointLight(0x4ade80, 3, 12); pl3.position.set(0, 5, -2);  scene.add(pl3);

    const group = new THREE.Group();
    scene.add(group);
    (groupRef as React.MutableRefObject<THREE.Group>).current = group;

    // ── Launch pad ────────────────────────────────────────────────────────────
    const padMat = new THREE.MeshPhongMaterial({
      color: 0x1e1e3f, emissive: 0x2233aa, emissiveIntensity: 0.3, shininess: 60,
    });
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.22, 16), padMat);
    pad.position.y = -2.2;
    group.add(pad);

    // Pad glow ring
    const padRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.04, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0x5865f2, transparent: true, opacity: 0.6 })
    );
    padRing.rotation.x = Math.PI / 2;
    padRing.position.y = -2.09;
    group.add(padRing);

    // Pad legs (3 support struts)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg   = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.5, 0.08),
        new THREE.MeshPhongMaterial({ color: 0x3344aa, emissive: 0x1122aa, emissiveIntensity: 0.2 })
      );
      leg.position.set(Math.cos(angle) * 0.7, -2.45, Math.sin(angle) * 0.7);
      leg.rotation.z = Math.cos(angle) * 0.3;
      leg.rotation.x = Math.sin(angle) * 0.3;
      group.add(leg);
    }

    // ── Rocket body ───────────────────────────────────────────────────────────
    const rocketGroup = new THREE.Group();
    rocketGroup.position.y = -1.5;
    group.add(rocketGroup);

    // Main body cylinder
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0xf0f0ff, emissive: 0x8888cc, emissiveIntensity: 0.2, shininess: 140,
    });
    const rocketBody = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.8, 20), bodyMat);
    rocketBody.userData.isRocket = true;
    rocketBody.userData.label    = 'Click to boost — deploy in 10 minutes!';
    rocketGroup.add(rocketBody);
    clickables.current.push(rocketBody);

    // Nose cone
    const noseMat = new THREE.MeshPhongMaterial({
      color: 0x5865f2, emissive: 0x3344cc, emissiveIntensity: 0.5, shininess: 120,
    });
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.9, 20), noseMat);
    nose.position.y = 1.35;
    nose.userData.isRocket = true;
    rocketGroup.add(nose);
    clickables.current.push(nose);

    // Window porthole
    const windowMat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.8, shininess: 200,
    });
    const porthole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 16), windowMat);
    porthole.rotation.x = Math.PI / 2;
    porthole.position.set(0, 0.4, 0.35);
    rocketGroup.add(porthole);

    // Side fins (3 fins)
    const finMat = new THREE.MeshPhongMaterial({
      color: 0x5865f2, emissive: 0x2233aa, emissiveIntensity: 0.4, shininess: 80,
    });
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const fin   = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.38), finMat);
      fin.position.set(Math.cos(angle) * 0.38, -0.75, Math.sin(angle) * 0.38);
      fin.rotation.y = angle;
      rocketGroup.add(fin);
    }

    // Rocket stripe
    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.385, 0.385, 0.12, 20),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.9 })
    );
    stripe.position.y = 0.1;
    rocketGroup.add(stripe);

    // ── Fire / exhaust particles ──────────────────────────────────────────────
    interface FireParticle {
      mesh: THREE.Mesh;
      life: number;
      speed: number;
      ox: number; oz: number; // offset from centre
    }

    const fireMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.9 });
    const fireParticles: FireParticle[] = [];
    for (let i = 0; i < 40; i++) {
      const size = 0.06 + Math.random() * 0.1;
      const m    = new THREE.Mesh(new THREE.SphereGeometry(size, 6, 6), fireMat.clone());
      rocketGroup.add(m);
      fireParticles.push({
        mesh: m,
        life: Math.random(),
        speed: 0.04 + Math.random() * 0.04,
        ox: (Math.random() - 0.5) * 0.25,
        oz: (Math.random() - 0.5) * 0.25,
      });
    }

    // ── Deployment progress ring ──────────────────────────────────────────────
    // A torus that we animate by changing arc length (simulated with opacity sectors)
    const progressRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.06, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.5 })
    );
    progressRing.rotation.x = Math.PI / 2;
    progressRing.position.y = -0.5;
    group.add(progressRing);

    // Progress fill arc (separate torus, arc grows over time)
    const progressFill = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.09, 8, 80, Math.PI * 2),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.85 })
    );
    progressFill.rotation.x = Math.PI / 2;
    progressFill.position.y = -0.5;
    group.add(progressFill);

    // ── "LIVE" indicator dot ──────────────────────────────────────────────────
    const liveDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x4ade80 })
    );
    liveDot.position.set(0, 2.8, 0);
    group.add(liveDot);

    const liveRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.03, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.5 })
    );
    liveRing.position.copy(liveDot.position);
    group.add(liveRing);

    // ── Team avatar spheres ───────────────────────────────────────────────────
    const AVATAR_COLORS = [0x5865f2, 0xf59e0b, 0xec4899, 0x06b6d4];
    const AVATAR_LABELS = ['Developer', 'Designer', 'Product Manager', 'DevOps'];

    interface AvatarData {
      mesh: THREE.Mesh;
      angle: number;
      radius: number;
      speed: number;
      tilt: number;
    }

    const avatars: AvatarData[] = [];
    const avatarSparkParticles: { mesh: THREE.Mesh; vel: THREE.Vector3 }[][] = [];

    AVATAR_COLORS.forEach((col, i) => {
      const mat  = new THREE.MeshPhongMaterial({
        color: col, emissive: col, emissiveIntensity: 0.5, shininess: 100,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), mat);
      mesh.userData.avatarIdx = i;
      mesh.userData.label     = AVATAR_LABELS[i] + ' — click to celebrate!';
      group.add(mesh);
      clickables.current.push(mesh);

      avatars.push({
        mesh,
        angle: (i / AVATAR_COLORS.length) * Math.PI * 2,
        radius: 2.2 + (i % 2) * 0.3,
        speed:  0.5 + i * 0.1,
        tilt:   (i - 1.5) * 0.5,
      });

      // Spark particles per avatar
      const sparks = Array.from({ length: 12 }, () => {
        const sm = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 6, 6),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 })
        );
        group.add(sm);
        const a2 = Math.random() * Math.PI * 2;
        return {
          mesh: sm,
          vel: new THREE.Vector3(Math.cos(a2) * 0.06, 0.04 + Math.random() * 0.04, Math.sin(a2) * 0.06),
        };
      });
      avatarSparkParticles.push(sparks);
    });

    // ── Speed lines (background streaks) ─────────────────────────────────────
    const speedLines: { line: THREE.Line; y: number; speed: number }[] = [];
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 8;
      const z = -1 - Math.random() * 3;
      const len = 0.4 + Math.random() * 0.8;
      const y   = (Math.random() - 0.5) * 6;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x, y + len, z),
      ]);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0x5865f2, transparent: true, opacity: 0.2 + Math.random() * 0.2,
      }));
      group.add(line);
      speedLines.push({ line, y, speed: 0.06 + Math.random() * 0.08 });
    }

    // ── Tooltip ───────────────────────────────────────────────────────────────
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const ndc  = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -((e.clientY - rect.top)  / rect.height) * 2 + 1
      );
      rayRef.current.setFromCamera(ndc, camera);
      const hits = rayRef.current.intersectObjects(clickables.current, true);
      if (hits.length > 0 && hits[0].object.userData.label) {
        setTooltip({ text: hits[0].object.userData.label, x: e.clientX - rect.left, y: e.clientY - rect.top - 36 });
      } else {
        setTooltip(null);
      }
    };
    mount.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();
    let autoRotY = 0;

    // Rocket base Y and boost state
    let rocketBaseY = -1.5;
    let rocketY     = rocketBaseY;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      autoRotY += 0.0015;

      // ── Rocket idle hover ────────────────────────────────────────────────
      rocketY = rocketBaseY + Math.sin(t * 1.4) * 0.12;

      // ── Boost ────────────────────────────────────────────────────────────
      if (boostRef.current) {
        boostT.current += 0.03;
        const bt = boostT.current;
        // Rocket shoots up then returns
        rocketY = rocketBaseY + Math.sin(t * 1.4) * 0.12 + Math.sin(bt * Math.PI) * 2.5;
        if (bt >= 1) {
          boostRef.current = false;
          boostT.current   = 0;
        }
      }

      rocketGroup.position.y = rocketY;

      // ── Fire particles ───────────────────────────────────────────────────
      const boostMult = boostRef.current ? 2.5 : 1;
      fireParticles.forEach(fp => {
        fp.life += fp.speed * boostMult;
        if (fp.life > 1) fp.life = 0;
        const l = fp.life;
        fp.mesh.position.set(
          fp.ox * l * 2,
          -0.9 - l * (1.2 + boostMult * 0.6),
          fp.oz * l * 2
        );
        fp.mesh.scale.setScalar(1 - l * 0.7);
        const mat = fp.mesh.material as THREE.MeshBasicMaterial;
        // Colour shifts orange → yellow → transparent
        mat.color.setHSL(0.08 - l * 0.05, 1, 0.5 + l * 0.2);
        mat.opacity = Math.max(0, 0.9 - l * 0.9);
      });

      // ── Progress ring fill ───────────────────────────────────────────────
      // Cycles 0 → full over 8 seconds then resets
      const progress = (t % 8) / 8;
      // Rebuild arc geometry each frame (simple approach: scale opacity)
      progressFill.rotation.z = -Math.PI / 2; // start from top
      // Simulate fill by rotating a partial torus — use scale trick
      progressFill.scale.set(1, 1, 1);
      (progressFill.material as THREE.MeshBasicMaterial).opacity = 0.3 + progress * 0.55;
      progressRing.rotation.z = t * 0.2;

      // ── LIVE dot pulse ───────────────────────────────────────────────────
      const livePulse = 1 + Math.sin(t * 3) * 0.25;
      liveDot.scale.setScalar(livePulse);
      liveRing.scale.setScalar(1 + Math.sin(t * 3) * 0.5);
      (liveRing.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - Math.sin(t * 3) * 0.4);

      // ── Team avatars orbit ───────────────────────────────────────────────
      avatars.forEach((av, i) => {
        const a = t * av.speed + av.angle;
        av.mesh.position.set(
          Math.cos(a) * av.radius,
          Math.sin(a * 0.5 + av.tilt) * 0.9,
          Math.sin(a) * av.radius * 0.55
        );
        av.mesh.rotation.y = t * 0.8 + i;

        // Spark animation
        if (avatarSparkIdx.current === i) {
          avatarSparkT.current += 0.05;
          const st = avatarSparkT.current;
          avatarSparkParticles[i].forEach(sp => {
            sp.mesh.position.set(
              av.mesh.position.x + sp.vel.x * st * 18,
              av.mesh.position.y + sp.vel.y * st * 18,
              av.mesh.position.z + sp.vel.z * st * 18
            );
            (sp.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - st);
          });
          if (st >= 1) {
            avatarSparkIdx.current = -1;
            avatarSparkParticles[i].forEach(sp => {
              (sp.mesh.material as THREE.MeshBasicMaterial).opacity = 0;
            });
          }
        }
      });

      // ── Speed lines scroll downward ──────────────────────────────────────
      speedLines.forEach(sl => {
        sl.y -= sl.speed;
        if (sl.y < -4) sl.y = 4;
        const pos = sl.line.geometry.attributes.position as THREE.BufferAttribute;
        const x   = pos.getX(0);
        const z   = pos.getZ(0);
        const len = pos.getY(1) - pos.getY(0);
        pos.setY(0, sl.y);
        pos.setY(1, sl.y + len);
        pos.needsUpdate = true;
        // Fade based on position
        (sl.line.material as THREE.LineBasicMaterial).opacity =
          0.15 + 0.2 * Math.abs(Math.sin(sl.y * 0.5));
      });

      // ── Pad ring pulse ───────────────────────────────────────────────────
      padRing.rotation.y = t * 0.5;
      (padRing.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(t * 2) * 0.2;

      // ── Lights orbit ─────────────────────────────────────────────────────
      pl1.position.x = Math.cos(t * 0.3) * 4;
      pl1.position.z = Math.sin(t * 0.3) * 4;
      pl2.position.x = Math.cos(t * 0.25 + Math.PI) * 3;
      pl2.position.z = Math.sin(t * 0.25 + Math.PI) * 3;

      applyToGroup(autoRotY);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }} aria-hidden="true">
      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.x, top: tooltip.y,
          background: 'rgba(10,10,25,0.93)', color: '#e0e0f0',
          padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
          pointerEvents: 'none', whiteSpace: 'nowrap',
          border: '1px solid rgba(88,101,242,0.5)', transform: 'translateX(-50%)', zIndex: 10,
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default KnowledgeScene;
