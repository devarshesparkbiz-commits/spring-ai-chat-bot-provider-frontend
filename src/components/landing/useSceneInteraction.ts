import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface InteractionOptions {
  /** How strongly drag rotates the scene (default 0.008) */
  dragSensitivity?: number;
  /** How strongly scroll zooms (default 0.001) */
  zoomSensitivity?: number;
  /** Min/max camera Z distance */
  zoomMin?: number;
  zoomMax?: number;
  /** Passive parallax on mouse move (no drag) */
  parallaxStrength?: number;
  /** Called when user clicks a mesh — receives the intersected object */
  onMeshClick?: (obj: THREE.Object3D) => void;
  /** Called on any canvas click (even empty space) */
  onClick?: (event: MouseEvent) => void;
}

interface InteractionState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
  rotX: number;
  rotY: number;
  targetRotX: number;
  targetRotY: number;
  zoom: number;
  targetZoom: number;
  mouseNDC: THREE.Vector2;
}

/**
 * Attaches drag-to-rotate, scroll-to-zoom, hover highlight, and click
 * interactions to a Three.js scene group.
 *
 * Returns a ref to attach to the mount div and a state ref for the animation
 * loop to read smooth interpolated values from.
 */
export function useSceneInteraction(
  mountRef: React.RefObject<HTMLDivElement | null>,
  groupRef: React.RefObject<THREE.Group | null>,
  camera: THREE.PerspectiveCamera | null,
  raycaster: THREE.Raycaster | null,
  clickableObjects: THREE.Object3D[],
  options: InteractionOptions = {}
) {
  const {
    dragSensitivity   = 0.008,
    zoomSensitivity   = 0.001,
    zoomMin           = 3,
    zoomMax           = 14,
    parallaxStrength  = 0.18,
    onMeshClick,
    onClick,
  } = options;

  const stateRef = useRef<InteractionState>({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    rotX: 0,
    rotY: 0,
    targetRotX: 0,
    targetRotY: 0,
    zoom: camera?.position.z ?? 8,
    targetZoom: camera?.position.z ?? 8,
    mouseNDC: new THREE.Vector2(),
  });

  // Hover state for cursor feedback
  const hoveredRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const state = stateRef.current;

    // ── Pointer down ─────────────────────────────────────────────────────────
    const onPointerDown = (e: PointerEvent) => {
      state.isDragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      mount.style.cursor = 'grabbing';
      mount.setPointerCapture(e.pointerId);
    };

    // ── Pointer move ─────────────────────────────────────────────────────────
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      state.mouseNDC.set(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -((e.clientY - rect.top)  / rect.height) * 2 + 1
      );

      if (state.isDragging) {
        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;
        state.targetRotY += dx * dragSensitivity;
        state.targetRotX += dy * dragSensitivity;
        // Clamp vertical rotation
        state.targetRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, state.targetRotX));
        state.lastX = e.clientX;
        state.lastY = e.clientY;
      } else {
        // Passive parallax
        state.targetRotY = (state.mouseNDC.x * parallaxStrength);
        state.targetRotX = (-state.mouseNDC.y * parallaxStrength * 0.6);
      }

      // Hover detection
      if (camera && raycaster && clickableObjects.length > 0) {
        raycaster.setFromCamera(state.mouseNDC, camera);
        const hits = raycaster.intersectObjects(clickableObjects, true);
        if (hits.length > 0) {
          const obj = hits[0].object;
          if (hoveredRef.current !== obj) {
            // Restore previous
            if (hoveredRef.current) {
              const mat = (hoveredRef.current as THREE.Mesh).material as THREE.MeshPhongMaterial;
              if (mat?.emissiveIntensity !== undefined) mat.emissiveIntensity /= 2.5;
            }
            hoveredRef.current = obj;
            // Brighten hovered
            const mat = (obj as THREE.Mesh).material as THREE.MeshPhongMaterial;
            if (mat?.emissiveIntensity !== undefined) mat.emissiveIntensity *= 2.5;
            mount.style.cursor = 'pointer';
          }
        } else {
          if (hoveredRef.current) {
            const mat = (hoveredRef.current as THREE.Mesh).material as THREE.MeshPhongMaterial;
            if (mat?.emissiveIntensity !== undefined) mat.emissiveIntensity /= 2.5;
            hoveredRef.current = null;
          }
          mount.style.cursor = state.isDragging ? 'grabbing' : 'grab';
        }
      }
    };

    // ── Pointer up ───────────────────────────────────────────────────────────
    const onPointerUp = (e: PointerEvent) => {
      state.isDragging = false;
      mount.style.cursor = 'grab';
      mount.releasePointerCapture(e.pointerId);
    };

    // ── Click ────────────────────────────────────────────────────────────────
    const onClickEvt = (e: MouseEvent) => {
      onClick?.(e);
      if (camera && raycaster && clickableObjects.length > 0) {
        raycaster.setFromCamera(state.mouseNDC, camera);
        const hits = raycaster.intersectObjects(clickableObjects, true);
        if (hits.length > 0) {
          onMeshClick?.(hits[0].object);
        }
      }
    };

    // ── Scroll to zoom ───────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.targetZoom = Math.max(
        zoomMin,
        Math.min(zoomMax, state.targetZoom + e.deltaY * zoomSensitivity)
      );
    };

    mount.style.cursor = 'grab';
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerup',   onPointerUp);
    mount.addEventListener('click',       onClickEvt);
    mount.addEventListener('wheel',       onWheel, { passive: false });

    return () => {
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerup',   onPointerUp);
      mount.removeEventListener('click',       onClickEvt);
      mount.removeEventListener('wheel',       onWheel);
    };
  }, [
    mountRef, camera, raycaster, clickableObjects,
    dragSensitivity, zoomSensitivity, zoomMin, zoomMax,
    parallaxStrength, onMeshClick, onClick,
  ]);

  /**
   * Call this inside your animation loop to apply smooth interpolation.
   * Pass the auto-rotation delta so drag overrides it.
   */
  const applyToGroup = (autoRotY = 0) => {
    const state = stateRef.current;
    const group = groupRef.current;
    if (!group) return;

    // Smooth lerp toward target
    state.rotX += (state.targetRotX - state.rotX) * 0.06;
    state.rotY += (state.targetRotY + autoRotY - state.rotY) * 0.06;

    group.rotation.x = state.rotX;
    group.rotation.y = state.rotY;

    // Zoom
    if (camera) {
      state.zoom += (state.targetZoom - state.zoom) * 0.06;
      camera.position.z = state.zoom;
    }
  };

  return { stateRef, applyToGroup };
}
