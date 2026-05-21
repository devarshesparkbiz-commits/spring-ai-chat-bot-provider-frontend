import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSceneInteraction } from './useSceneInteraction';

/**
 * HERO SCENE — "Conversational AI Brain"
 *
 * Interactions:
 *  - Drag to rotate the entire scene
 *  - Scroll to zoom in/out
 *  - Click a message bubble → it expands and glows briefly
 *  - Click the AI avatar → triggers a "thinking" pulse burst
 *  - Hover any object → brightens it
 *  - Tooltip label appears on hover
 */
const ChatbotScene: React.FC = () => {
  const mountRef  = useRef<HTMLDivElement>(null);
  const groupRef  = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rayRef    = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Clickable objects registry (filled during setup)
  const clickables = useRef<THREE.Object3D[]>([]);

  const { applyToGroup } = useSceneInteraction(
    mountRef,
    groupRef as React.RefObject<THREE.Group | null>,
    cameraRef.current,
    rayRef.current,
    clickables.current,
    {
      zoomMin: 5,
      zoomMax: 14,
      dragSensitivity: 0.009,
      parallaxStrength: 0.22,
      onMeshClick: (obj) => {
        // Trigger a scale pop on click
        const mesh = obj as THREE.Mesh;
        const origScale = mesh.scale.clone();
        mesh.scale.setScalar(1.4);
        setTimeout(() => mesh.scale.copy(origScale), 200);
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
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // ── Lights ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pl1 = new THREE.PointLight(0x5865f2, 5, 18);
    pl1.position.set(4, 3, 4);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x7c3aed, 4, 18);
    pl2.position.set(-4, -2, 2);
    scene.add(pl2);
    const pl3 = new THREE.PointLight(0x06b6d4, 3, 12);
    pl3.position.set(0, 5, -2);
    scene.add(pl3);

    // ── Group ────────────────────────────────────────────────────────────────
    const group = new THREE.Group();
    scene.add(group);
    (groupRef as React.MutableRefObject<THREE.Group>).current = group;

    // ── Chat window frame ────────────────────────────────────────────────────
    const frameGeo = new THREE.BoxGeometry(3.2, 4.2, 0.08);
    const frameMat = new THREE.MeshPhongMaterial({
      color: 0x1e1e3f, emissive: 0x2233aa, emissiveIntensity: 0.15,
      transparent: true, opacity: 0.55, shininess: 60,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, -0.3, 0);
    group.add(frame);
    const frameEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(frameGeo),
      new THREE.LineBasicMaterial({ color: 0x5865f2, transparent: true, opacity: 0.7 })
    );
    frameEdges.position.copy(frame.position);
    group.add(frameEdges);

    // Header bar
    const header = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.55, 0.09),
      new THREE.MeshPhongMaterial({ color: 0x5865f2, emissive: 0x3344cc, emissiveIntensity: 0.4 })
    );
    header.position.set(0, 1.625, 0.01);
    group.add(header);

    // Traffic-light dots
    [0xff5f57, 0xffbd2e, 0x28c840].forEach((c, i) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshBasicMaterial({ color: c })
      );
      dot.position.set(-1.3 + i * 0.22, 1.625, 0.1);
      group.add(dot);
      clickables.current.push(dot);
    });

    // ── Message bubbles ──────────────────────────────────────────────────────
    interface Bubble { mesh: THREE.Mesh; baseY: number; speed: number; label: string }
    const bubbles: Bubble[] = [];
    const bubbleData = [
      { y: -1.8, isUser: false, w: 1.8, x: -0.3, label: 'AI: How can I help?' },
      { y: -1.1, isUser: true,  w: 1.4, x:  0.4, label: 'You: Tell me more'   },
      { y: -0.4, isUser: false, w: 2.0, x: -0.2, label: 'AI: Sure! Here\'s...' },
      { y:  0.3, isUser: true,  w: 1.2, x:  0.5, label: 'You: Thanks!'         },
      { y:  0.9, isUser: false, w: 1.6, x: -0.3, label: 'AI: Anything else?'  },
    ];

    bubbleData.forEach(b => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(b.w, 0.32, 0.06),
        new THREE.MeshPhongMaterial({
          color: b.isUser ? 0x5865f2 : 0x2a2a4e,
          emissive: b.isUser ? 0x3344cc : 0x111133,
          emissiveIntensity: 0.3,
          transparent: true, opacity: 0.85,
        })
      );
      mesh.position.set(b.x, b.y, 0.06);
      mesh.userData.label = b.label;
      group.add(mesh);
      clickables.current.push(mesh);
      bubbles.push({ mesh, baseY: b.y, speed: 0.15 + Math.random() * 0.1, label: b.label });
    });

    // ── AI Avatar ────────────────────────────────────────────────────────────
    const avatarMat = new THREE.MeshPhongMaterial({
      color: 0x5865f2, emissive: 0x2233cc, emissiveIntensity: 0.7, shininess: 140,
    });
    const avatar = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 48), avatarMat);
    avatar.position.set(0, 2.6, 0);
    avatar.userData.label = 'AI Core — click to pulse';
    group.add(avatar);
    clickables.current.push(avatar);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.025, 16, 80),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.7 })
    );
    halo.position.copy(avatar.position);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    const outerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x5865f2, transparent: true, opacity: 0.07, side: THREE.BackSide })
    );
    outerGlow.position.copy(avatar.position);
    group.add(outerGlow);

    // ── Doc icons + stream lines ─────────────────────────────────────────────
    const docPositions = [
      new THREE.Vector3(-3.2, 0.5, -1),
      new THREE.Vector3( 3.2, 1.0, -1),
      new THREE.Vector3(-2.8, -1.5, -0.5),
      new THREE.Vector3( 2.8, -1.0, -0.5),
    ];

    docPositions.forEach((pos, i) => {
      const doc = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.38, 0.04),
        new THREE.MeshPhongMaterial({ color: 0x7c3aed, emissive: 0x4422aa, emissiveIntensity: 0.5 })
      );
      doc.position.copy(pos);
      doc.userData.label = `Document ${i + 1} — drag to explore`;
      group.add(doc);
      clickables.current.push(doc);

      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([pos.clone(), avatar.position.clone()]),
        new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.2 })
      ));
    });

    // ── Data packets ─────────────────────────────────────────────────────────
    interface Packet { mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t: number; speed: number }
    const packets: Packet[] = docPositions.map((pos, i) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      group.add(mesh);
      return { mesh, from: pos.clone(), to: avatar.position.clone(), t: i * 0.25, speed: 0.3 + Math.random() * 0.2 };
    });

    // ── Orbit shapes ─────────────────────────────────────────────────────────
    const orbitItems: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; tilt: number }[] = [];
    [
      { geo: new THREE.OctahedronGeometry(0.18),   color: 0xf59e0b, label: 'API Key'   },
      { geo: new THREE.TetrahedronGeometry(0.18),  color: 0x22c55e, label: 'RAG Docs'  },
      { geo: new THREE.IcosahedronGeometry(0.15),  color: 0x06b6d4, label: 'Analytics' },
      { geo: new THREE.DodecahedronGeometry(0.15), color: 0xa855f7, label: 'SDK'       },
    ].forEach((item, i) => {
      const mesh = new THREE.Mesh(item.geo, new THREE.MeshPhongMaterial({
        color: item.color, emissive: item.color, emissiveIntensity: 0.5, shininess: 80,
      }));
      mesh.userData.label = item.label;
      group.add(mesh);
      clickables.current.push(mesh);
      orbitItems.push({ mesh, angle: (i / 4) * Math.PI * 2, radius: 2.8 + i * 0.3, speed: 0.25 + i * 0.08, tilt: (i - 1.5) * 0.4 });
    });

    // ── Particles ────────────────────────────────────────────────────────────
    const pPos = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 22;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x818cf8, size: 0.035, transparent: true, opacity: 0.45, sizeAttenuation: true,
    }));
    group.add(particles);

    // ── Tooltip on hover ─────────────────────────────────────────────────────
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const ndc  = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -((e.clientY - rect.top)  / rect.height) * 2 + 1
      );
      rayRef.current.setFromCamera(ndc, camera);
      const hits = rayRef.current.intersectObjects(clickables.current, true);
      if (hits.length > 0 && hits[0].object.userData.label) {
        setTooltip({
          text: hits[0].object.userData.label,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 36,
        });
      } else {
        setTooltip(null);
      }
    };
    mount.addEventListener('pointermove', onPointerMove);

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animation ────────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();
    let autoRotY = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      autoRotY += 0.002;

      avatar.scale.setScalar(1 + Math.sin(t * 2.5) * 0.04);
      avatarMat.emissiveIntensity = 0.6 + Math.sin(t * 2.5) * 0.25;
      halo.rotation.z = t * 0.8;
      outerGlow.scale.setScalar(1 + Math.sin(t * 1.5) * 0.08);

      bubbles.forEach((b, i) => {
        b.mesh.position.y = b.baseY + Math.sin(t * b.speed + i) * 0.06;
      });

      packets.forEach(pk => {
        pk.t = (pk.t + pk.speed * 0.008) % 1;
        pk.mesh.position.lerpVectors(pk.from, pk.to, pk.t);
        pk.mesh.scale.setScalar(0.5 + Math.sin(pk.t * Math.PI) * 0.5);
      });

      orbitItems.forEach(item => {
        const a = t * item.speed + item.angle;
        item.mesh.position.set(
          Math.cos(a) * item.radius,
          Math.sin(a * 0.6 + item.tilt) * 1.2,
          Math.sin(a) * item.radius * 0.5
        );
        item.mesh.rotation.x = t * 0.9;
        item.mesh.rotation.y = t * 0.7;
      });

      particles.rotation.y = t * 0.015;
      pl1.position.x = Math.cos(t * 0.4) * 5;
      pl1.position.z = Math.sin(t * 0.4) * 5;
      pl2.position.x = Math.cos(t * 0.35 + Math.PI) * 4;
      pl2.position.z = Math.sin(t * 0.35 + Math.PI) * 4;

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
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y,
          background: 'rgba(15,15,30,0.92)',
          color: '#e0e0f0',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          border: '1px solid rgba(88,101,242,0.5)',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default ChatbotScene;
