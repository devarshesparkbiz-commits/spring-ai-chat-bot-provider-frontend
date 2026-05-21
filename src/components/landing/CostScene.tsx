import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSceneInteraction } from './useSceneInteraction';

/**
 * COST SCENE — "Per-Message Meter vs Flat Rate"
 *
 * Directly visualises the copy: "Stop paying per-message. Pay for what you use."
 *
 * LEFT side — Per-message billing:
 *   A red "meter" box with stacked digit-like slabs that scroll upward
 *   (simulating a cost counter ticking up). Small message-bubble quads
 *   rise from it, each one adding to the cost. A red ❌ ring orbits it.
 *
 * RIGHT side — Flat rate:
 *   A clean green price-tag shape (rounded box + hole + ribbon) that
 *   glows calmly. A ✓ checkmark floats above it. Stable, no movement.
 *
 * A faint "vs" divider bar sits between them.
 *
 * Interactions:
 *  - Drag to orbit
 *  - Scroll to zoom
 *  - Click the meter → it shakes and emits a red burst ("expensive!")
 *  - Click the price tag → it pulses green and emits a calm burst
 *  - Hover → tooltip
 */
const CostScene: React.FC = () => {
  const mountRef   = useRef<HTMLDivElement>(null);
  const groupRef   = useRef<THREE.Group>(null);
  const cameraRef  = useRef<THREE.PerspectiveCamera | null>(null);
  const rayRef     = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const clickables = useRef<THREE.Object3D[]>([]);

  const meterShakeRef  = useRef(false);
  const meterShakeT    = useRef(0);
  const tagBurstRef    = useRef(false);
  const tagBurstT      = useRef(0);

  const { applyToGroup } = useSceneInteraction(
    mountRef,
    groupRef as React.RefObject<THREE.Group | null>,
    cameraRef.current,
    rayRef.current,
    clickables.current,
    {
      zoomMin: 3.5,
      zoomMax: 12,
      dragSensitivity: 0.009,
      parallaxStrength: 0.14,
      onMeshClick: (obj) => {
        if (obj.userData.isMeter) { meterShakeRef.current = true; meterShakeT.current = 0; }
        if (obj.userData.isTag)   { tagBurstRef.current   = true; tagBurstT.current   = 0; }
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
    const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 50);
    camera.position.set(0, 0.5, 8.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const redLight   = new THREE.PointLight(0xef4444, 5, 14); redLight.position.set(-4, 3, 3);   scene.add(redLight);
    const greenLight = new THREE.PointLight(0x22c55e, 5, 14); greenLight.position.set(4, 3, 3);  scene.add(greenLight);
    const topLight   = new THREE.PointLight(0xffffff, 2, 18); topLight.position.set(0, 6, 2);    scene.add(topLight);

    const group = new THREE.Group();
    scene.add(group);
    (groupRef as React.MutableRefObject<THREE.Group>).current = group;

    // ════════════════════════════════════════════════════════════════════════
    // LEFT — Per-message meter
    // ════════════════════════════════════════════════════════════════════════
    const meterGroup = new THREE.Group();
    meterGroup.position.set(-2.6, 0, 0);
    group.add(meterGroup);

    // Meter housing (dark box)
    const housingMat = new THREE.MeshPhongMaterial({
      color: 0x1a0505, emissive: 0x330000, emissiveIntensity: 0.4, shininess: 60,
    });
    const housing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.35), housingMat);
    housing.userData.isMeter = true;
    housing.userData.label   = 'Per-message billing — costs keep rising!';
    meterGroup.add(housing);
    clickables.current.push(housing);

    // Red edge glow
    const hEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.82, 2.42, 0.37)),
      new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7 })
    );
    meterGroup.add(hEdges);

    // Screen area (slightly inset bright panel)
    const screenMat = new THREE.MeshPhongMaterial({
      color: 0x0d0000, emissive: 0xef4444, emissiveIntensity: 0.12, shininess: 120,
    });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 0.36), screenMat);
    screen.position.y = 0.2;
    meterGroup.add(screen);

    // Scrolling digit rows — 5 rows of thin slabs that move upward
    const DIGIT_ROWS = 5;
    const digitSlabs: THREE.Mesh[] = [];
    const digitColors = [0xef4444, 0xf97316, 0xfbbf24, 0xef4444, 0xf97316];
    for (let i = 0; i < DIGIT_ROWS; i++) {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.22, 0.37),
        new THREE.MeshPhongMaterial({
          color: digitColors[i],
          emissive: digitColors[i],
          emissiveIntensity: 0.5,
          shininess: 80,
          transparent: true,
          opacity: 0.85,
        })
      );
      slab.position.y = -0.5 + i * 0.28;
      meterGroup.add(slab);
      digitSlabs.push(slab);
    }

    // "$" symbol on meter face
    const dollarBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    dollarBar.position.set(0, -0.85, 0.19);
    meterGroup.add(dollarBar);

    // Red X ring orbiting the meter
    const xRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.04, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 })
    );
    xRing.rotation.x = Math.PI / 3;
    meterGroup.add(xRing);

    // Rising message bubbles (small quads that float up from meter)
    interface MsgBubble { mesh: THREE.Mesh; y: number; speed: number; x: number }
    const msgBubbles: MsgBubble[] = [];
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.16, 0.06),
        new THREE.MeshBasicMaterial({
          color: 0xef4444, transparent: true, opacity: 0.7,
        })
      );
      const startY = -1.2 + Math.random() * 2.4;
      m.position.set((Math.random() - 0.5) * 0.8, startY, 0.22);
      meterGroup.add(m);
      msgBubbles.push({ mesh: m, y: startY, speed: 0.012 + Math.random() * 0.01, x: (Math.random() - 0.5) * 0.8 });
    }

    // Meter shake burst particles
    const meterBurst: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 })
      );
      group.add(m);
      const a = (i / 24) * Math.PI * 2;
      meterBurst.push({
        mesh: m,
        vel: new THREE.Vector3(Math.cos(a) * 0.07, 0.03 + Math.random() * 0.05, Math.sin(a) * 0.07),
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // VS divider
    // ════════════════════════════════════════════════════════════════════════
    const vsBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 3.2, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x444466, transparent: true, opacity: 0.4 })
    );
    group.add(vsBar);

    // ════════════════════════════════════════════════════════════════════════
    // RIGHT — Flat rate price tag
    // ════════════════════════════════════════════════════════════════════════
    const tagGroup = new THREE.Group();
    tagGroup.position.set(2.6, 0, 0);
    group.add(tagGroup);

    // Tag body (rounded box approximated with a box + bevelled edges)
    const tagMat = new THREE.MeshPhongMaterial({
      color: 0x052e16, emissive: 0x16a34a, emissiveIntensity: 0.45, shininess: 100,
    });
    const tagBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.3), tagMat);
    tagBody.userData.isTag  = true;
    tagBody.userData.label  = 'Flat rate — one price, unlimited messages';
    tagGroup.add(tagBody);
    clickables.current.push(tagBody);

    // Green edge glow
    const tEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.82, 2.42, 0.32)),
      new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.8 })
    );
    tagGroup.add(tEdges);

    // Tag "hole" at top (small torus = the string hole)
    const hole = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.05, 10, 30),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.8 })
    );
    hole.position.y = 1.3;
    tagGroup.add(hole);

    // String from hole upward
    const stringGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 1.3, 0),
      new THREE.Vector3(0, 1.9, 0),
    ]);
    tagGroup.add(new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0x86efac, transparent: true, opacity: 0.6 })));

    // "$49" represented as three green slabs (price display)
    const priceMat = new THREE.MeshPhongMaterial({
      color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 0.6, shininess: 120,
    });
    // Large price slab
    const priceSlab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.38, 0.32), priceMat);
    priceSlab.position.y = 0.25;
    tagGroup.add(priceSlab);

    // "per month" smaller slab
    const perMonthMat = new THREE.MeshPhongMaterial({
      color: 0x16a34a, emissive: 0x16a34a, emissiveIntensity: 0.3, shininess: 80,
    });
    const perMonthSlab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.32), perMonthMat);
    perMonthSlab.position.y = -0.12;
    tagGroup.add(perMonthSlab);

    // Divider line on tag
    const divLine = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.03, 0.32),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.4 })
    );
    divLine.position.y = 0.0;
    tagGroup.add(divLine);

    // "Unlimited" row
    const unlimSlab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.32), perMonthMat.clone());
    unlimSlab.position.y = -0.45;
    tagGroup.add(unlimSlab);

    // Checkmark above tag
    const ckMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
    const ck1 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.32, 0.07), ckMat);
    ck1.position.set(-0.08, 0.82, 0.16); ck1.rotation.z = 0.5;
    tagGroup.add(ck1);
    const ck2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), ckMat);
    ck2.position.set(0.1, 0.9, 0.16); ck2.rotation.z = -0.9;
    tagGroup.add(ck2);

    // Orbiting glow ring
    const tagRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.035, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.45 })
    );
    tagRing.rotation.x = Math.PI / 3;
    tagGroup.add(tagRing);

    // Tag burst particles
    const tagBurst: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];
    for (let i = 0; i < 28; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0 })
      );
      group.add(m);
      const a = (i / 28) * Math.PI * 2;
      tagBurst.push({
        mesh: m,
        vel: new THREE.Vector3(Math.cos(a) * 0.07, 0.04 + Math.random() * 0.04, Math.sin(a) * 0.07),
      });
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

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      autoRotY += 0.0018;

      // ── Meter: scrolling digit slabs ──────────────────────────────────────
      digitSlabs.forEach((slab, i) => {
        // Each slab scrolls upward at slightly different speeds
        const speed = 0.4 + i * 0.08;
        slab.position.y = -0.5 + ((i * 0.28 + t * speed) % (DIGIT_ROWS * 0.28));
        // Fade out near top/bottom of screen area
        const relY = slab.position.y;
        const fade = 1 - Math.abs(relY - 0.2) / 0.9;
        (slab.material as THREE.MeshPhongMaterial).opacity = Math.max(0.1, Math.min(0.9, fade));
      });

      // Rising message bubbles
      msgBubbles.forEach((mb, i) => {
        mb.y += mb.speed;
        if (mb.y > 1.4) {
          mb.y = -1.2;
          mb.x = (Math.random() - 0.5) * 0.8;
        }
        mb.mesh.position.set(mb.x, mb.y, 0.22);
        (mb.mesh.material as THREE.MeshBasicMaterial).opacity =
          0.7 * (1 - Math.abs(mb.y - 0.1) / 1.3);
      });

      // X ring spin
      xRing.rotation.z = t * 0.6;
      xRing.rotation.y = t * 0.3;

      // Meter shake
      if (meterShakeRef.current) {
        meterShakeT.current += 0.05;
        const st = meterShakeT.current;
        meterGroup.position.x = -2.6 + Math.sin(st * 18) * 0.12 * Math.max(0, 1 - st);
        meterBurst.forEach(mb => {
          mb.mesh.position.set(
            -2.6 + mb.vel.x * st * 22,
            mb.vel.y * st * 22,
            mb.vel.z * st * 22
          );
          (mb.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - st);
        });
        if (st >= 1) {
          meterShakeRef.current = false;
          meterGroup.position.x = -2.6;
          meterBurst.forEach(mb => { (mb.mesh.material as THREE.MeshBasicMaterial).opacity = 0; });
        }
      }

      // ── Price tag: calm glow ──────────────────────────────────────────────
      tagMat.emissiveIntensity = 0.4 + Math.sin(t * 1.4) * 0.12;
      priceMat.emissiveIntensity = 0.55 + Math.sin(t * 1.8) * 0.18;
      tagRing.rotation.z = t * 0.35;
      tagRing.rotation.y = t * 0.18;

      // Gentle float
      tagGroup.position.y = Math.sin(t * 0.9) * 0.08;

      // Tag burst
      if (tagBurstRef.current) {
        tagBurstT.current += 0.04;
        const bt = tagBurstT.current;
        tagBurst.forEach(tb => {
          tb.mesh.position.set(
            2.6 + tb.vel.x * bt * 22,
            tb.vel.y * bt * 22,
            tb.vel.z * bt * 22
          );
          (tb.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - bt);
        });
        if (bt >= 1) {
          tagBurstRef.current = false;
          tagBurst.forEach(tb => { (tb.mesh.material as THREE.MeshBasicMaterial).opacity = 0; });
        }
      }

      // Lights orbit
      redLight.position.x   = -4 + Math.cos(t * 0.35) * 1.5;
      redLight.position.z   =  3 + Math.sin(t * 0.35) * 1.5;
      greenLight.position.x =  4 + Math.cos(t * 0.3 + Math.PI) * 1.5;
      greenLight.position.z =  3 + Math.sin(t * 0.3 + Math.PI) * 1.5;

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
          background: 'rgba(10,5,5,0.93)', color: '#e0e0f0',
          padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
          pointerEvents: 'none', whiteSpace: 'nowrap',
          border: '1px solid rgba(239,68,68,0.4)', transform: 'translateX(-50%)', zIndex: 10,
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default CostScene;
