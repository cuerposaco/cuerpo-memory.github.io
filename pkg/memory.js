
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_22(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h073eddf56cbd187d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_25(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h073eddf56cbd187d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_28(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h073eddf56cbd187d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_31(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h073eddf56cbd187d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_34(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h9220e625399cab4e(arg0, arg1);
}

function __wbg_adapter_37(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h073eddf56cbd187d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_40(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h073eddf56cbd187d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_43(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h073eddf56cbd187d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_46(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h60a9b49fcbb9dbb8(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_49(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h06832a9ac2bec42b(arg0, arg1);
}

function __wbg_adapter_52(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h60a9b49fcbb9dbb8(arg0, arg1, addHeapObject(arg2));
}

/**
*/
export function main() {
    wasm.main();
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachegetFloat32Memory0 = null;
function getFloat32Memory0() {
    if (cachegetFloat32Memory0 === null || cachegetFloat32Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachegetFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = import.meta.url.replace(/\.js$/, '_bg.wasm');
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_self_1c83eb4471d9eb9b = handleError(function() {
        var ret = self.self;
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_static_accessor_MODULE_abf5ae284bffdf45 = function() {
        var ret = module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_5b2b5b594d809d9f = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_c12f14e810edcaa2 = function(arg0) {
        var ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_679be765111ba775 = function(arg0) {
        var ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_getRandomValues_05a60bf171bfc2be = function(arg0) {
        var ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_3ac1b33c90b52596 = function(arg0, arg1, arg2) {
        getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_randomFillSync_6f956029658662ec = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_bindVertexArray_569f8b5466293fb0 = function(arg0, arg1) {
        getObject(arg0).bindVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_bufferData_b5889c60c7d61946 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_createVertexArray_1f35f6d163bbae13 = function(arg0) {
        var ret = getObject(arg0).createVertexArray();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_texImage2D_652cb43ecf938fbf = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    });
    imports.wbg.__wbg_texImage2D_8c4ef0458bccd3fd = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4 >>> 0, arg5 >>> 0, getObject(arg6));
    });
    imports.wbg.__wbg_texSubImage2D_a381fad696bf4f1a = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9 === 0 ? undefined : getArrayU8FromWasm0(arg9, arg10));
    });
    imports.wbg.__wbg_texSubImage2D_83422eaf99d87fe2 = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    });
    imports.wbg.__wbg_texSubImage2D_6776be6869e938bd = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
    });
    imports.wbg.__wbg_uniformMatrix4fv_27bd1dff527241ff = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_activeTexture_a756131b7b4547f3 = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_attachShader_386953a8caf97e31 = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindBuffer_2cb370d7ee8c8faa = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_f3ab6393f75a763f = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blendFunc_8593e88646aa2829 = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_clear_8e691dd4fbcdb78d = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearColor_c478bc8e70dd1fde = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_clearStencil_435f815da46191ea = function(arg0, arg1) {
        getObject(arg0).clearStencil(arg1);
    };
    imports.wbg.__wbg_colorMask_7254359629a73c1c = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_compileShader_3c4bd5d4666a9951 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_createBuffer_a9e0a9167dc2f2b4 = function(arg0) {
        var ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_4823f8197c94860f = function(arg0) {
        var ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_9378e5028efeddcf = function(arg0, arg1) {
        var ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_151a385cd028c893 = function(arg0) {
        var ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteBuffer_a983cfd5488ab211 = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_f19537f7a0ed5646 = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_53c81cb9e33c580e = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_125ab82d8330e268 = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_detachShader_0d8564c4e718d7fc = function(arg0, arg1, arg2) {
        getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_disableVertexAttribArray_70e22d4bd114dd10 = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_5793555840ecaa0b = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_drawElements_4572c575d9e77ece = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__wbg_enable_f7d5513a12216046 = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_3f2a29ade8fb65f9 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_getAttribLocation_713a1d120f1e32ba = function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).getAttribLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return ret;
    };
    imports.wbg.__wbg_getProgramInfoLog_900722958284ce83 = function(arg0, arg1, arg2) {
        var ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getProgramParameter_7f66eafe63848c93 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_6e3d36e74e32aa2b = function(arg0, arg1, arg2) {
        var ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getShaderParameter_d3ad5fb12a1da258 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_02d298730d44dadc = function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_linkProgram_be955380b2064b69 = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_shaderSource_0b51ed30c2234a07 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_stencilFunc_353976ddd65b6098 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilFunc(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_aaf398326e477fc4 = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilOp_d816bfdec859ac6f = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilOp(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_texParameteri_6e7ba8c54bb639f2 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_uniform1f_261f72c2259e8b74 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform1i_2cb54693e4c3bace = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform2f_9983be9fcaad4947 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2f(getObject(arg1), arg2, arg3);
    };
    imports.wbg.__wbg_uniform4f_e765aa68f64ca6c9 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_useProgram_6b54e2f64672af62 = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_vertexAttribPointer_12aeb3ec86d48d18 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_ec826bf788ce964f = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_instanceof_Window_49f532f06a9786ee = function(arg0) {
        var ret = getObject(arg0) instanceof Window;
        return ret;
    };
    imports.wbg.__wbg_document_c0366b39e4f4c89a = function(arg0) {
        var ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_innerWidth_cea04a991524ea87 = handleError(function(arg0) {
        var ret = getObject(arg0).innerWidth;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_innerHeight_83651dca462998d1 = handleError(function(arg0) {
        var ret = getObject(arg0).innerHeight;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_devicePixelRatio_268c49438a600d53 = function(arg0) {
        var ret = getObject(arg0).devicePixelRatio;
        return ret;
    };
    imports.wbg.__wbg_cancelAnimationFrame_60f9cf59ec1c0125 = handleError(function(arg0, arg1) {
        getObject(arg0).cancelAnimationFrame(arg1);
    });
    imports.wbg.__wbg_matchMedia_f9355258d56dc891 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_requestAnimationFrame_ef0e2294dc8b1088 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
        return ret;
    });
    imports.wbg.__wbg_get_03d057a4fd2b7031 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0)[getStringFromWasm0(arg1, arg2)];
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clearTimeout_cf42c747400433ba = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_setTimeout_7df13099c62f73a7 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    });
    imports.wbg.__wbg_target_4bc4eb28204bcc44 = function(arg0) {
        var ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cancelBubble_62eb67fd286e013f = function(arg0) {
        var ret = getObject(arg0).cancelBubble;
        return ret;
    };
    imports.wbg.__wbg_preventDefault_9aab6c264e5df3ee = function(arg0) {
        getObject(arg0).preventDefault();
    };
    imports.wbg.__wbg_stopPropagation_697200010cec9b7e = function(arg0) {
        getObject(arg0).stopPropagation();
    };
    imports.wbg.__wbg_x_d61460e3c817f5b2 = function(arg0) {
        var ret = getObject(arg0).x;
        return ret;
    };
    imports.wbg.__wbg_y_e4e5b87d074dc33d = function(arg0) {
        var ret = getObject(arg0).y;
        return ret;
    };
    imports.wbg.__wbg_matches_2f8453eb8e607f46 = function(arg0) {
        var ret = getObject(arg0).matches;
        return ret;
    };
    imports.wbg.__wbg_addListener_34d9bdd94b12c993 = handleError(function(arg0, arg1) {
        getObject(arg0).addListener(getObject(arg1));
    });
    imports.wbg.__wbg_removeListener_5571e3bc24e85d2c = handleError(function(arg0, arg1) {
        getObject(arg0).removeListener(getObject(arg1));
    });
    imports.wbg.__wbg_setProperty_46b9bd1b0fad730b = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    });
    imports.wbg.__wbg_appendChild_7c45aeccd496f2a5 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_removeChild_1e1942a296b255c1 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).removeChild(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_clientX_3a14a1583294607f = function(arg0) {
        var ret = getObject(arg0).clientX;
        return ret;
    };
    imports.wbg.__wbg_clientY_4b4a322b80551002 = function(arg0) {
        var ret = getObject(arg0).clientY;
        return ret;
    };
    imports.wbg.__wbg_offsetX_4bd8c9fcb457cf0b = function(arg0) {
        var ret = getObject(arg0).offsetX;
        return ret;
    };
    imports.wbg.__wbg_offsetY_0dde12490e8ebfba = function(arg0) {
        var ret = getObject(arg0).offsetY;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_fadbf4d226c5a071 = function(arg0) {
        var ret = getObject(arg0).ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_6df8deff50c0048c = function(arg0) {
        var ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_altKey_470315032c1b4a35 = function(arg0) {
        var ret = getObject(arg0).altKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_42ae5f8d628a98d5 = function(arg0) {
        var ret = getObject(arg0).metaKey;
        return ret;
    };
    imports.wbg.__wbg_button_9e74bd912190b055 = function(arg0) {
        var ret = getObject(arg0).button;
        return ret;
    };
    imports.wbg.__wbg_buttons_5d3db1e47542f585 = function(arg0) {
        var ret = getObject(arg0).buttons;
        return ret;
    };
    imports.wbg.__wbg_bindVertexArrayOES_17e98f43d896f40b = function(arg0, arg1) {
        getObject(arg0).bindVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_createVertexArrayOES_393e00fa6f931f59 = function(arg0) {
        var ret = getObject(arg0).createVertexArrayOES();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_width_e7926b51debf3daa = function(arg0) {
        var ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_deltaX_5fac4f36a42e6ec9 = function(arg0) {
        var ret = getObject(arg0).deltaX;
        return ret;
    };
    imports.wbg.__wbg_deltaY_2722120e563d3160 = function(arg0) {
        var ret = getObject(arg0).deltaY;
        return ret;
    };
    imports.wbg.__wbg_deltaMode_3db3c9c4bedf191d = function(arg0) {
        var ret = getObject(arg0).deltaMode;
        return ret;
    };
    imports.wbg.__wbg_matches_c1680f96c1f19da4 = function(arg0) {
        var ret = getObject(arg0).matches;
        return ret;
    };
    imports.wbg.__wbg_now_7628760b7b640632 = function(arg0) {
        var ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_pointerId_602db5c989b38cc0 = function(arg0) {
        var ret = getObject(arg0).pointerId;
        return ret;
    };
    imports.wbg.__wbg_body_c8cb19d760637268 = function(arg0) {
        var ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_fullscreenElement_40ed1ecabc8c860a = function(arg0) {
        var ret = getObject(arg0).fullscreenElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createElement_99351c8bf0efac6e = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_getElementById_15aef17a620252b4 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clientWidth_2c84a7ebc75dd4f0 = function(arg0) {
        var ret = getObject(arg0).clientWidth;
        return ret;
    };
    imports.wbg.__wbg_clientHeight_f56dfe03d1c42f3e = function(arg0) {
        var ret = getObject(arg0).clientHeight;
        return ret;
    };
    imports.wbg.__wbg_getBoundingClientRect_505844bd8eb35668 = function(arg0) {
        var ret = getObject(arg0).getBoundingClientRect();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestFullscreen_60b4644a038d0689 = handleError(function(arg0) {
        getObject(arg0).requestFullscreen();
    });
    imports.wbg.__wbg_setAttribute_e71b9086539f06a1 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    });
    imports.wbg.__wbg_setPointerCapture_54ee987062d42d03 = handleError(function(arg0, arg1) {
        getObject(arg0).setPointerCapture(arg1);
    });
    imports.wbg.__wbg_instanceof_WebGlRenderingContext_ef4e51c6e4133d85 = function(arg0) {
        var ret = getObject(arg0) instanceof WebGLRenderingContext;
        return ret;
    };
    imports.wbg.__wbg_bufferData_dc5899657e9f1803 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_texImage2D_6b433ad1d91323ea = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    });
    imports.wbg.__wbg_texImage2D_a50e3b9a9ff4695b = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4 >>> 0, arg5 >>> 0, getObject(arg6));
    });
    imports.wbg.__wbg_texSubImage2D_1c1c77ce8e5d9232 = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9 === 0 ? undefined : getArrayU8FromWasm0(arg9, arg10));
    });
    imports.wbg.__wbg_texSubImage2D_a2d2a24a447318b9 = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    });
    imports.wbg.__wbg_uniformMatrix4fv_088c96db8ee28c1d = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_activeTexture_a51ec6273de88bc6 = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_attachShader_0dd248f6ab98fcf2 = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindBuffer_1ceb83e9674e812a = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_6121e6db3f879582 = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blendFunc_34a6bb31770822c5 = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_clear_f6b2dd48aeed2752 = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearColor_89f7819aa9f80129 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_clearStencil_9bae3b2da5d4fe2d = function(arg0, arg1) {
        getObject(arg0).clearStencil(arg1);
    };
    imports.wbg.__wbg_colorMask_88ebee15531b14ef = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_compileShader_28bdbafe4445d24b = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_createBuffer_acedc3831832a280 = function(arg0) {
        var ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_7e2f44b7b74694d4 = function(arg0) {
        var ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_64c474f1d1d0c1f8 = function(arg0, arg1) {
        var ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_0a156dab1efc3499 = function(arg0) {
        var ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteBuffer_79c4c051e57a9cf7 = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_c86e81ed9dcee4ba = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_183b279d1e903e2d = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_cbd0cfac3a7506b6 = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_detachShader_7c42d3c18f91c39c = function(arg0, arg1, arg2) {
        getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_disableVertexAttribArray_ba8f39ecd28c601b = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_604abf0ccb310fe7 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_drawElements_3eb5ba8a511ce0f0 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__wbg_enable_87f39f6396535e1f = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_f29c8dde9c8c5cf5 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_getAttribLocation_ba61f837da80e249 = function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).getAttribLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return ret;
    };
    imports.wbg.__wbg_getExtension_c6863c255090d82f = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_getProgramInfoLog_aacf06c959070653 = function(arg0, arg1, arg2) {
        var ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getProgramParameter_a89bf14502c109f7 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_1eb885f2468e2429 = function(arg0, arg1, arg2) {
        var ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getShaderParameter_99510442d33c6589 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_ca853de4f2f9270d = function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_linkProgram_46a36cb158f10676 = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_shaderSource_700ae72fca39850d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_stencilFunc_cc85d77d2098446b = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilFunc(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_ed2cded2c2b0b72c = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilOp_1b3529546c1fdcc2 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilOp(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_texParameteri_e45f3977eb998137 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_uniform1f_3eb09312a513b94a = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform1i_e76b668973ae0655 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform2f_6298542797865c61 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2f(getObject(arg1), arg2, arg3);
    };
    imports.wbg.__wbg_uniform4f_df665e266e041cad = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_useProgram_d63a57db0571e803 = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_vertexAttribPointer_b4b829a4f5a3778e = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_54305c74f5668b33 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_error_d58d9958868010f6 = function(arg0, arg1) {
        console.error(getObject(arg0), getObject(arg1));
    };
    imports.wbg.__wbg_setinnerText_dd8b837024c5b7bc = function(arg0, arg1, arg2) {
        getObject(arg0).innerText = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_style_9b773f0fc441eddc = function(arg0) {
        var ret = getObject(arg0).style;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_offsetHeight_95b3fffa64ec6020 = function(arg0) {
        var ret = getObject(arg0).offsetHeight;
        return ret;
    };
    imports.wbg.__wbg_setonload_6fb79f39cb59de67 = function(arg0, arg1) {
        getObject(arg0).onload = getObject(arg1);
    };
    imports.wbg.__wbg_instanceof_CanvasRenderingContext2d_1d38418d1d6c8b34 = function(arg0) {
        var ret = getObject(arg0) instanceof CanvasRenderingContext2D;
        return ret;
    };
    imports.wbg.__wbg_setfillStyle_bbe97cb93eb1b55c = function(arg0, arg1) {
        getObject(arg0).fillStyle = getObject(arg1);
    };
    imports.wbg.__wbg_setfont_8a2c2ff87f58b6bc = function(arg0, arg1, arg2) {
        getObject(arg0).font = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_settextAlign_e0e4a8d736538f13 = function(arg0, arg1, arg2) {
        getObject(arg0).textAlign = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_settextBaseline_f6a9bc9be52407dc = function(arg0, arg1, arg2) {
        getObject(arg0).textBaseline = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_fillRect_c79d1b386c04efed = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).fillRect(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_fillText_189081612f6e05d5 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
    });
    imports.wbg.__wbg_measureText_f25c8dd544cdfd7e = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).measureText(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_instanceof_HtmlSpanElement_3d40c012180e34d8 = function(arg0) {
        var ret = getObject(arg0) instanceof HTMLSpanElement;
        return ret;
    };
    imports.wbg.__wbg_charCode_eb123e299efafe3f = function(arg0) {
        var ret = getObject(arg0).charCode;
        return ret;
    };
    imports.wbg.__wbg_keyCode_47f9e9228bc483bf = function(arg0) {
        var ret = getObject(arg0).keyCode;
        return ret;
    };
    imports.wbg.__wbg_altKey_8a59e1cf32636010 = function(arg0) {
        var ret = getObject(arg0).altKey;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_17377b46ca5a072d = function(arg0) {
        var ret = getObject(arg0).ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_09be9a7e6cad7a99 = function(arg0) {
        var ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_a707288e6c45a0e0 = function(arg0) {
        var ret = getObject(arg0).metaKey;
        return ret;
    };
    imports.wbg.__wbg_key_d9b602f48baca7bc = function(arg0, arg1) {
        var ret = getObject(arg1).key;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_code_cbf76ad384ae1179 = function(arg0, arg1) {
        var ret = getObject(arg1).code;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getModifierState_e62cfa723da709b4 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getModifierState(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_addEventListener_6a37bc32387cb66d = handleError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    });
    imports.wbg.__wbg_addEventListener_a422088e686210b5 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
    });
    imports.wbg.__wbg_removeEventListener_70dfb387da1982ac = handleError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    });
    imports.wbg.__wbg_instanceof_HtmlCanvasElement_7bd3ee7838f11fc3 = function(arg0) {
        var ret = getObject(arg0) instanceof HTMLCanvasElement;
        return ret;
    };
    imports.wbg.__wbg_width_0efa4604d41c58c5 = function(arg0) {
        var ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_setwidth_1d0e975feecff3ef = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_height_aa24e3fef658c4a8 = function(arg0) {
        var ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_setheight_7758ee3ff5c65474 = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_getContext_3db9399e6dc524ff = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_getContext_93be69215ea9dbbf = handleError(function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_setsrc_ca894d724570195d = function(arg0, arg1, arg2) {
        getObject(arg0).src = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_setcrossOrigin_e1a35c32f0633f24 = function(arg0, arg1, arg2) {
        getObject(arg0).crossOrigin = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_width_f3b349ce7a53895c = function(arg0) {
        var ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_height_59f27baafc5c7528 = function(arg0) {
        var ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_new_1f2ded01c889cd38 = handleError(function() {
        var ret = new Image();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_get_85e0a3b459845fe2 = handleError(function(arg0, arg1) {
        var ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_call_951bd0c6d815d6f1 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newnoargs_7c6bd521992b4022 = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_is_049b1aece40b5301 = function(arg0, arg1) {
        var ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_new_ba07d0daa0e4677e = function() {
        var ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_6baf3a3aa7b63415 = handleError(function() {
        var ret = self.self;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_window_63fc4027b66c265b = handleError(function() {
        var ret = window.window;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_globalThis_513fb247e8e4e6d2 = handleError(function() {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_global_b87245cd886d7113 = handleError(function() {
        var ret = global.global;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_buffer_3f12a1c608c6d04e = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_7d7a65b6ce7bbbf2 = function(arg0, arg1, arg2) {
        var ret = new Int8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_5c8ecf8811a498ad = function(arg0, arg1, arg2) {
        var ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_fd32b452467cda28 = function(arg0, arg1, arg2) {
        var ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_4c51342f87299c5a = function(arg0, arg1, arg2) {
        var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_353b9b3e1eece05f = function(arg0, arg1, arg2) {
        var ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_2016b902c412c87c = function(arg0, arg1, arg2) {
        var ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_9428545f18592c34 = function(arg0, arg1, arg2) {
        var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_9bdd413385146137 = handleError(function(arg0, arg1, arg2) {
        var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    });
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper565 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 191, __wbg_adapter_22);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper567 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 191, __wbg_adapter_25);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper569 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 191, __wbg_adapter_28);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper571 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 191, __wbg_adapter_31);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper573 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 191, __wbg_adapter_34);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper575 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 191, __wbg_adapter_37);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper577 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 191, __wbg_adapter_40);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper579 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 191, __wbg_adapter_43);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1497 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_46);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1499 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_49);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1501 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_52);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    wasm.__wbindgen_start();
    return wasm;
}

export default init;

