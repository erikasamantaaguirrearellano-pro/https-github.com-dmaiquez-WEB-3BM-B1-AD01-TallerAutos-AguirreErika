/**
 * ============================================================================
 * SISTEMA DE MANTENIMIENTO AUTOMOTRIZ - AUTOCAT TALLER
 * PRÁCTICA: PROGRAMACIÓN WEB 2
 * ============================================================================
 */

const STORAGE_KEYS = {
    USUARIOS:   'autofix_usuarios_v30',
    SOLICITUDES:'autofix_solicitudes_v30',
    SESION:     'autofix_sesion_activa_v30'
};

const USUARIOS_INICIALES = [
    {
        id: 'USR-01',
        nombre: 'Erika Aguirre',
        correo: 'erika@gmail.com',
        clave: '1220',
        rol: 'cliente',
        telefono: '0991234567',
        cedula: '1724567890',
        estado: 'activo'
    },
    {
        id: 'USR-02',
        nombre: 'Administrador General',
        correo: 'admin@gmail.com',
        clave: 'admin1234',
        rol: 'admin',
        telefono: '0998887776',
        cedula: '1701122334',
        estado: 'activo'
    },
    {
        id: 'USR-04',
        nombre: 'Diego Tutor',
        correo: 'diego@gmail.com',
        clave: '4321',
        rol: 'cliente',
        telefono: '0998765432',
        cedula: '1712345678',
        estado: 'activo'
    }
];

const SOLICITUDES_INICIALES = [
    {
        id: 'MNT-101',
        clienteNombre: 'Erika Aguirre',
        clienteCorreo: 'erika@gmail.com',
        clienteTelefono: '0991234567',
        clienteCedula: '1724567890',
        placa: 'PBA-1220',
        marca: 'Chevrolet',
        modelo: 'Aveo Family',
        anio: 2020,
        kilometraje: 42000,
        servicio: 'Mantenimiento Preventivo y Cambio de Aceite',
        modalidad: 'Taller Principal',
        turnos: ['Matutino'],
        fechaCita: '2026-11-15',
        adicionales: ['Rotación de neumáticos'],
        observaciones: 'Vehículo en fosa técnica: cambio de aceite 10W-30, filtro de aceite y revisión de niveles.',
        estado: 'En mantenimiento',
        fechaRegistro: '2026-11-01'
    }
];

function inicializarAlmacenamiento() {
    for (let i = 1; i <= 29; i++) {
        localStorage.removeItem(`autofix_usuarios_v${i}`);
        localStorage.removeItem(`autofix_solicitudes_v${i}`);
        localStorage.removeItem(`autofix_sesion_activa_v${i}`);
        localStorage.removeItem(`autocat_usuarios_v${i}`);
        localStorage.removeItem(`autocat_solicitudes_v${i}`);
        localStorage.removeItem(`autocat_sesion_activa_v${i}`);
    }

    if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
        localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(USUARIOS_INICIALES));
    }
    
    const guardadas = localStorage.getItem(STORAGE_KEYS.SOLICITUDES);
    if (!guardadas || JSON.parse(guardadas).length === 0) {
        localStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(SOLICITUDES_INICIALES));
    }
}

function obtenerUsuarios() {
    inicializarAlmacenamiento();
    const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    return data ? JSON.parse(data) : [];
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
}

function obtenerSolicitudes() {
    inicializarAlmacenamiento();
    const data = localStorage.getItem(STORAGE_KEYS.SOLICITUDES);
    let list = data ? JSON.parse(data) : [];
    if (!list || list.length === 0) {
        list = [...SOLICITUDES_INICIALES];
        guardarSolicitudes(list);
    }
    return list;
}

function guardarSolicitudes(solicitudes) {
    localStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(solicitudes));
}

function obtenerSesionActual() {
    const sesion = localStorage.getItem(STORAGE_KEYS.SESION);
    return sesion ? JSON.parse(sesion) : null;
}

function guardarSesion(usuario) {
    localStorage.setItem(STORAGE_KEYS.SESION, JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem(STORAGE_KEYS.SESION);
    Swal.fire({
        icon: 'info',
        title: 'Sesión cerrada',
        text: 'Has salido de AutoFix Taller.',
        timer: 1300,
        showConfirmButton: false
    }).then(() => {
        window.location.href = 'index.html';
    });
}

function verificarAccesoAdminEstricto() {
    const sesion = obtenerSesionActual();
    const mainEl = document.getElementById('admin-main');

    if (!sesion || sesion.rol !== 'admin') {
        if (mainEl) mainEl.style.display = 'none';
        Swal.fire({
            icon: 'warning',
            title: 'INGRESE SESIÓN',
            text: 'Debes iniciar sesión como administrador para acceder a este panel.',
            confirmButtonColor: '#4a2c1a',
            confirmButtonText: 'INICIE SESION COMO ADMINISTRADOR',
            allowOutsideClick: false
        }).then(() => {
            window.location.href = 'cuenta.html';
        });
        return;
    }

    if (mainEl) mainEl.style.display = 'block';
    renderizarDashboardAdmin();
}

function autenticarUsuario(correo, clave) {
    const usuarios = obtenerUsuarios();
    const email = correo.trim().toLowerCase();
    const pass  = clave.trim();
    const usuario = usuarios.find(u => u.correo.toLowerCase() === email);
    if (!usuario) return { exito: false, mensaje: 'No existe una cuenta con este correo.' };
    if (usuario.clave !== pass) return { exito: false, mensaje: 'Contraseña incorrecta.' };
    return { exito: true, usuario };
}

function registrarNuevoCliente(nombre, correo, clave, telefono, cedula) {
    const usuarios = obtenerUsuarios();
    const email = correo.trim().toLowerCase();
    
    if (usuarios.some(u => u.correo.toLowerCase() === email)) {
        return { exito: false, mensaje: 'Ya existe una cuenta registrada con este correo.' };
    }

    const nuevoUsuario = {
        id: 'USR-' + String(usuarios.length + 1).padStart(2, '0'),
        nombre: nombre.trim(),
        correo: email,
        clave: clave.trim(),
        rol: 'cliente_nuevo',
        telefono: telefono ? telefono.trim() : '0990000000',
        cedula: cedula ? cedula.trim() : '1700000000',
        estado: 'activo'
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    return { exito: true, usuario: nuevoUsuario };
}

const Validador = {
    validarPlaca(placa) {
        return /^[A-Z]{3}-?\d{3,4}$/i.test(placa.trim());
    },
    formatearPlaca(placa) {
        const limpia = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        return limpia.length >= 6 ? `${limpia.substring(0,3)}-${limpia.substring(3)}` : limpia;
    },
    validarAnio(anio) {
        const n = parseInt(anio, 10);
        return !isNaN(n) && n >= 1980 && n <= 2027;
    },
    validarKilometraje(km) {
        const n = parseFloat(km);
        return !isNaN(n) && n >= 0;
    },
    validarTelefono(tel) {
        return /^09\d{8}$/.test(tel.trim());
    }
};

function actualizarBarraNavegacion() {
    const contenedor = document.getElementById('navbar-auth-section');
    if (!contenedor) return;

    const sesion = obtenerSesionActual();
    const navInicio     = document.getElementById('nav-inicio');
    const navSolicitar  = document.getElementById('nav-solicitar');
    const navAdmin      = document.getElementById('nav-admin');

    if (sesion) {
        const rolTexto = sesion.rol === 'admin' ? 'Admin' : (sesion.rol === 'cliente_nuevo' ? 'Cliente Nuevo' : 'Cliente');
        contenedor.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <span class="user-pill d-inline-flex align-items-center">
                    <i class="fa-solid fa-wrench me-1" style="color: #e6b88a;"></i> <span class="me-1">${rolTexto}:</span> <strong>${sesion.nombre}</strong>
                </span>
                <button onclick="cerrarSesion()" class="btn btn-sm btn-outline-light">
                    <i class="fa-solid fa-right-from-bracket me-1"></i>Salir
                </button>
            </div>
        `;
        if (navInicio)    navInicio.style.display    = '';
        if (navSolicitar) navSolicitar.style.display = '';
        if (navAdmin)     navAdmin.style.display     = sesion.rol === 'admin' ? '' : 'none';
    } else {
        contenedor.innerHTML = `
            <a href="cuenta.html" class="btn btn-sm btn-beige fw-bold">
                <i class="fa-solid fa-right-to-bracket me-1"></i> Iniciar Sesión
            </a>
        `;
        if (navInicio)    navInicio.style.display    = '';
        if (navSolicitar) navSolicitar.style.display = 'none';
        if (navAdmin)     navAdmin.style.display     = 'none';
    }
}

function inicializarPaginaSolicitudes() {
    const sesion = obtenerSesionActual();
    if (!sesion) {
        Swal.fire({
            icon: 'warning',
            title: 'Inicia Sesión Requerida',
            text: 'Para solicitar un mantenimiento debes registrarte o iniciar sesión con tu cuenta.',
            confirmButtonColor: '#4a2c1a',
            confirmButtonText: 'Ir a Iniciar Sesión',
            allowOutsideClick: false
        }).then(() => {
            window.location.href = 'cuenta.html';
        });
        return;
    }

    const form = document.getElementById('form-mantenimiento');
    if (!form) return;

    const inputNombre   = document.getElementById('clienteNombre');
    const inputCorreo   = document.getElementById('clienteCorreo');
    const inputTelefono = document.getElementById('clienteTelefono');
    const inputCedula   = document.getElementById('clienteCedula');

    if (inputNombre)   inputNombre.value   = sesion.nombre;
    if (inputCorreo) {
        inputCorreo.value = sesion.correo;
        if (sesion.rol !== 'admin') inputCorreo.readOnly = true;
    }
    if (inputTelefono && sesion.telefono) inputTelefono.value = sesion.telefono;
    if (inputCedula   && sesion.cedula)   inputCedula.value   = sesion.cedula;

    const inputFecha = document.getElementById('fechaCita');
    if (inputFecha) {
        inputFecha.setAttribute('min', new Date().toISOString().split('T')[0]);
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const clienteNombre   = document.getElementById('clienteNombre').value.trim();
        const clienteCorreo   = document.getElementById('clienteCorreo').value.trim();
        const clienteTelefono = document.getElementById('clienteTelefono').value.trim();
        const clienteCedula   = document.getElementById('clienteCedula').value.trim();
        const placa           = Validador.formatearPlaca(document.getElementById('placa').value);
        const marca           = document.getElementById('marca').value;
        const modelo          = document.getElementById('modelo').value.trim();
        const anio            = document.getElementById('anio').value;
        const kilometraje     = document.getElementById('kilometraje').value;
        const servicio        = document.getElementById('servicio').value;
        const fechaCita       = document.getElementById('fechaCita').value;
        const observaciones   = document.getElementById('observaciones').value.trim();

        const radioModalidad  = document.querySelector('input[name="modalidad"]:checked');
        const modalidad       = radioModalidad ? radioModalidad.value : 'Taller Principal';

        const checkTurnos = document.querySelectorAll('input[name="turnos"]:checked');
        const turnos = [];
        for (const chk of checkTurnos) turnos.push(chk.value);

        const errores = [];
        if (!clienteNombre)  errores.push('Ingresa tu nombre completo.');
        if (!clienteCorreo || !clienteCorreo.includes('@')) errores.push('Correo electrónico no válido.');
        if (!Validador.validarTelefono(clienteTelefono)) errores.push('Teléfono debe tener 10 dígitos y empezar con 09.');
        if (!clienteCedula || clienteCedula.replace(/\D/g,'').length !== 10) errores.push('La cédula debe tener exactamente 10 dígitos.');
        if (!Validador.validarPlaca(placa)) errores.push('Formato de placa inválido (Ej: PBA-1220).');
        if (!marca)  errores.push('Selecciona la marca del vehículo.');
        if (!modelo) errores.push('Ingresa el modelo del vehículo.');
        if (!Validador.validarAnio(anio)) errores.push('Año inválido (1980 – 2027).');
        if (!Validador.validarKilometraje(kilometraje)) errores.push('El kilometraje debe ser un número positivo.');
        if (!servicio)  errores.push('Selecciona el tipo de servicio.');
        if (!fechaCita) errores.push('Selecciona la fecha de la cita.');
        if (turnos.length === 0) errores.push('Selecciona al menos un turno (Matutino o Vespertino).');

        if (errores.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Verifica los campos',
                html: `<ul class="text-start mb-0 ps-3">${errores.map(e => `<li class="text-danger small">${e}</li>`).join('')}</ul>`,
                confirmButtonColor: '#4a2c1a'
            });
            return;
        }

        const solicitudes = obtenerSolicitudes();
        const nuevoId = 'MNT-' + (101 + solicitudes.length);

        const nuevaSolicitud = {
            id: nuevoId,
            clienteNombre,
            clienteCorreo,
            clienteTelefono,
            clienteCedula,
            placa,
            marca,
            modelo,
            anio: parseInt(anio, 10),
            kilometraje: parseInt(kilometraje, 10),
            servicio,
            modalidad,
            turnos,
            fechaCita,
            adicionales: [],
            observaciones: observaciones || 'Sin observaciones.',
            estado: 'Llevado al taller',
            fechaRegistro: new Date().toLocaleDateString('es-EC')
        };

        solicitudes.push(nuevaSolicitud);
        guardarSolicitudes(solicitudes);

        Swal.fire({
            icon: 'success',
            title: '¡Solicitud Guardada!',
            text: `Se registró la cita para el vehículo ${marca} ${modelo} (${placa}).`,
            confirmButtonText: 'Ver mis citas',
            confirmButtonColor: '#4a2c1a'
        }).then(() => {
            window.location.href = 'cuenta.html';
        });
    });
}

function inicializarPaginaCuenta() {
    const formLogin = document.getElementById('form-login');
    const seccionLogin = document.getElementById('seccion-login');
    const seccionPerfil = document.getElementById('seccion-perfil');
    const sesion = obtenerSesionActual();

    const inputCorreoLogin = document.getElementById('loginCorreo');
    if (inputCorreoLogin) {
        inputCorreoLogin.setAttribute('placeholder', 'ejemplo@gmail.com');
        if (inputCorreoLogin.value === 'erika@gmail.com' || inputCorreoLogin.value === 'diego@gmail.com') {
            inputCorreoLogin.value = '';
        }
    }

    // [AGREGADO]: Envoltorio y botón para ver contraseña en el input de login si existe
    const inputClaveLogin = document.getElementById('loginClave');
    if (inputClaveLogin && !document.getElementById('btn-toggle-login-pass')) {
        const padre = inputClaveLogin.parentNode;
        if (!padre.classList.contains('input-group')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-group';
            inputClaveLogin.parentNode.insertBefore(wrapper, inputClaveLogin);
            wrapper.appendChild(inputClaveLogin);

            const btnOjo = document.createElement('button');
            btnOjo.className = 'btn btn-outline-secondary';
            btnOjo.type = 'button';
            btnOjo.id = 'btn-toggle-login-pass';
            btnOjo.innerHTML = '<i class="fa-solid fa-eye" id="icono-ojo-login"></i>';
            btnOjo.setAttribute('onclick', "toggleMostrarContrasena('loginClave', 'icono-ojo-login')");
            wrapper.appendChild(btnOjo);
        }
    }

    if (sesion) {
        if (seccionLogin) {
            seccionLogin.style.cssText = "display: none !important;";
            seccionLogin.classList.add('d-none');
        }
        const contenedorEncabezadoLogin = document.querySelector('h3.text-center, .container.my-4 > div:first-child');
        if (contenedorEncabezadoLogin && contenedorEncabezadoLogin.textContent.includes('Iniciar Sesión')) {
            contenedorEncabezadoLogin.style.cssText = "display: none !important;";
        }

        if (seccionPerfil) {
            seccionPerfil.style.cssText = "display: block !important; width: 100% !important; margin-top: 2rem !important;";
            seccionPerfil.classList.remove('d-none');
        }
        renderizarPerfilYMisSolicitudes(sesion);
        return;
    }

    if (seccionLogin)  {
        seccionLogin.style.cssText = "display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; width: 100% !important; margin: 2rem auto !important; float: none !important;";
        seccionLogin.classList.remove('d-none');
        
        const columnas = seccionLogin.querySelectorAll('.col, [class*="col-"]');
        columnas.forEach(col => {
            col.className = "w-100 d-flex justify-content-center align-items-center";
            col.style.float = "none";
            col.style.margin = "0 auto";
        });

        const tarjetas = seccionLogin.querySelectorAll('.card, .card-custom');
        if (tarjetas.length > 1) {
            for (let i = 1; i < tarjetas.length; i++) {
                tarjetas[i].remove();
            }
        }

        const tarjetaLogin = seccionLogin.querySelector('.card, .card-custom') || seccionLogin.firstElementChild;
        if (tarjetaLogin) {
            tarjetaLogin.style.cssText = "width: 100% !important; max-width: 450px !important; margin: 0 auto !important; float: none !important; display: block !important;";
        }
    }
    if (seccionPerfil) {
        seccionPerfil.style.cssText = "display: none !important;";
        seccionPerfil.classList.add('d-none');
    }

    const cardBodyLogin = seccionLogin ? seccionLogin.querySelector('.card-body') || seccionLogin.querySelector('.card, .card-custom') || seccionLogin : null;
    if (cardBodyLogin && !document.getElementById('link-registro-interior')) {
        const divLink = document.createElement('div');
        divLink.className = 'text-center mt-3 pt-2 border-top';
        divLink.innerHTML = `
            <a href="javascript:void(0);" id="link-registro-interior" onclick="abrirModalRegistroCliente()" class="small text-decoration-none fw-bold" style="color: var(--color-cafe-oscuro);">
                <i class="fa-solid fa-user-plus me-1"></i> ¿No tienes cuenta? Regístrate aquí
            </a>
        `;
        cardBodyLogin.appendChild(divLink);
    }

    const demoBox = document.querySelector('.demo-user-box');
    if (demoBox) {
        demoBox.style.display = 'none';
    }

    if (!formLogin) return;

    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        const correo = document.getElementById('loginCorreo').value.trim();
        const clave  = document.getElementById('loginClave').value.trim();

        if (!correo || !clave) {
            Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Ingresa correo y contraseña.', confirmButtonColor: '#4a2c1a' });
            return;
        }

        const res = autenticarUsuario(correo, clave);
        if (!res.exito) {
            Swal.fire({ icon: 'error', title: 'Acceso Denegado', text: res.mensaje, confirmButtonColor: '#4a2c1a' });
            return;
        }

        guardarSesion(res.usuario);
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido(a), ${res.usuario.nombre}!`,
            timer: 1300,
            showConfirmButton: false
        }).then(() => {
            actualizarBarraNavegacion();
            if (res.usuario.rol === 'admin') {
                window.location.href = 'admin.html';
            } else {
                inicializarPaginaCuenta();
            }
        });
    });
}

function abrirModalRegistroCliente() {
    Swal.fire({
        title: '<i class="fa-solid fa-user-plus text-warning me-2"></i> Registro de Nuevo Cliente',
        html: `
            <div class="text-start small">
                <p class="text-muted mb-3">Ingresa tus datos para registrarte. Luego podrás iniciar sesión con tu correo y contraseña:</p>
                <div class="mb-2">
                    <label class="form-label fw-bold">Nombre Completo:</label>
                    <input type="text" id="reg-nombre" class="form-control" placeholder="Ej: Alexa Gómez">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-bold">Correo Electrónico:</label>
                    <input type="email" id="reg-correo" class="form-control" placeholder="ejemplo@gmail.com">
                </div>
                <div class="mb-2">
                    <label class="form-label fw-bold">Contraseña:</label>
                    <div class="input-group">
                        <input type="password" id="reg-clave" class="form-control" placeholder="Ej: 5678">
                        <button class="btn btn-outline-secondary" type="button" onclick="toggleMostrarContrasena('reg-clave', 'icono-ojo-reg')">
                            <i class="fa-solid fa-eye" id="icono-ojo-reg"></i>
                        </button>
                    </div>
                </div>
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <label class="form-label fw-bold">Teléfono:</label>
                        <input type="tel" id="reg-telefono" class="form-control" maxlength="10" placeholder="0991234567">
                    </div>
                    <div class="col-6">
                        <label class="form-label fw-bold">Cédula:</label>
                        <input type="text" id="reg-cedula" class="form-control" maxlength="10" placeholder="1720000000">
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#4a2c1a',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Registrarse',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = document.getElementById('reg-nombre').value.trim();
            const correo = document.getElementById('reg-correo').value.trim();
            const clave  = document.getElementById('reg-clave').value.trim();
            const telefono = document.getElementById('reg-telefono').value.trim();
            const cedula = document.getElementById('reg-cedula').value.trim();

            if (!nombre || !correo || !clave) {
                Swal.showValidationMessage('Nombre, correo y contraseña son obligatorios.');
                return false;
            }
            return { nombre, correo, clave, telefono, cedula };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const data = result.value;
            const res = registrarNuevoCliente(data.nombre, data.correo, data.clave, data.telefono, data.cedula);
            if (!res.exito) {
                Swal.fire({ icon: 'error', title: 'Error', text: res.mensaje, confirmButtonColor: '#4a2c1a' });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: 'Tu cuenta ha sido creada. Ahora ya puedes iniciar sesión ingresando tu correo y contraseña.',
                confirmButtonColor: '#4a2c1a'
            });
        }
    });
}

// [AGREGADO]: Función auxiliar para alternar la visibilidad de la contraseña
function toggleMostrarContrasena(idInput, idIcono) {
    const input = document.getElementById(idInput);
    const icono = document.getElementById(idIcono);
    if (!input || !icono) return;

    if (input.type === 'password') {
        input.type = 'text';
        icono.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icono.className = 'fa-solid fa-eye';
    }
}

function renderizarPerfilYMisSolicitudes(sesion) {
    const elNombre   = document.getElementById('perfil-nombre');
    const elCorreo   = document.getElementById('perfil-correo');
    const elRol      = document.getElementById('perfil-rol');
    const elTelefono = document.getElementById('perfil-telefono');
    const elCedula   = document.getElementById('perfil-cedula');
    const contBotones = document.getElementById('perfil-botones-acciones');

    if (elNombre)   elNombre.textContent   = sesion.nombre;
    if (elCorreo)   elCorreo.textContent   = sesion.correo;
    if (elRol) {
        elRol.textContent = sesion.rol === 'admin' ? 'ADMINISTRADOR' : (sesion.rol === 'cliente_nuevo' ? 'CLIENTE NUEVO' : 'CLIENTE');
        elRol.className   = 'badge bg-secondary text-white';
    }
    if (elTelefono) elTelefono.textContent = sesion.telefono || '---';
    if (elCedula)   elCedula.textContent   = sesion.cedula || '---';

    if (contBotones) {
        if (sesion.rol === 'admin') {
            contBotones.innerHTML = `
                <a href="admin.html" class="btn btn-warning fw-bold">
                    <i class="fa-solid fa-shield-halved me-1"></i> Ir al Panel de Administrador
                </a>
            `;
        } else {
            contBotones.innerHTML = `
                <a href="inscripciones.html" class="btn btn-beige">
                    <i class="fa-solid fa-calendar-plus me-1"></i> Solicitar Mantenimiento
                </a>
            `;
        }
    }

    const todas = obtenerSolicitudes();
    const misSolicitudes = todas.filter(s => s.clienteCorreo.toLowerCase() === sesion.correo.toLowerCase());
    const tbody = document.getElementById('tabla-mis-solicitudes');
    const alertaVacio = document.getElementById('alerta-sin-solicitudes');

    if (misSolicitudes.length === 0) {
        if (tbody) tbody.innerHTML = '';
        if (alertaVacio) {
            alertaVacio.classList.remove('d-none');
            alertaVacio.innerHTML = `
                <p class="mb-2">No tienes mantenimientos registrados actualmente.</p>
                <a href="inscripciones.html" class="btn btn-cafe btn-sm">Agendar mi primer servicio</a>
            `;
        }
        return;
    }

    if (alertaVacio) alertaVacio.classList.add('d-none');
    if (tbody) {
        tbody.innerHTML = '';
        misSolicitudes.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td class="fw-bold">${item.id}</td>
                    <td><strong>${item.marca} ${item.modelo}</strong><br><small class="badge bg-dark">${item.placa}</small></td>
                    <td>${item.servicio}</td>
                    <td>${item.fechaCita}</td>
                    <td>${Number(item.kilometraje).toLocaleString()} km</td>
                    <td><span class="badge bg-warning text-dark">${item.estado}</span></td>
                    <td class="text-center">
                        <button onclick="verComentariosCliente('${item.id}')" class="btn btn-sm btn-cafe">
                            <i class="fa-solid fa-comments me-1"></i> Ver Comentarios
                        </button>
                    </td>
                </tr>
            `;
        });
    }
}

function verComentariosCliente(id) {
    const solicitudes = obtenerSolicitudes();
    const item = solicitudes.find(s => s.id === id);
    if (!item) return;

    Swal.fire({
        title: `<i class="fa-solid fa-file-invoice text-warning me-2"></i> Seguimiento #${item.id}`,
        html: `
            <div class="text-start small p-3 rounded" style="background-color: var(--color-beige-claro); border: 1px solid var(--color-beige-oscuro);">
                <p class="mb-1"><strong>Vehículo:</strong> ${item.marca} ${item.modelo} (${item.placa})</p>
                <p class="mb-1"><strong>Servicio:</strong> ${item.servicio}</p>
                <p class="mb-2"><strong>Estado actual:</strong> <span class="badge bg-warning text-dark">${item.estado}</span></p>
                <div class="p-2 rounded bg-white border">
                    <strong><i class="fa-solid fa-comment-dots text-warning me-1"></i> Comentarios / Sugerencias del Administrador:</strong>
                    <p class="mb-0 text-muted fst-italic mt-1">${item.observaciones || 'Aún no hay comentarios del taller.'}</p>
                </div>
            </div>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#4a2c1a'
    });
}

function inicializarPaginaAdmin() {
    const tabla = document.getElementById('tabla-admin-solicitudes');
    if (!tabla) return;
    verificarAccesoAdminEstricto();
}

function renderizarDashboardAdmin(filtroTexto = '', filtroEstado = 'todos') {
    const solicitudes = obtenerSolicitudes();

    const elTotal = document.getElementById('stat-total');
    const elPendientes = document.getElementById('stat-pendientes');
    const elProceso = document.getElementById('stat-proceso');
    const elFinalizados = document.getElementById('stat-finalizados');

    if (elTotal) elTotal.textContent = solicitudes.length;
    if (elPendientes) elPendientes.textContent = solicitudes.filter(s => ['Llevado al taller', 'Revisando', 'Pendiente'].includes(s.estado)).length;
    if (elProceso) elProceso.textContent = solicitudes.filter(s => ['En mantenimiento', 'Lavado y control', 'En proceso'].includes(s.estado)).length;
    if (elFinalizados) elFinalizados.textContent = solicitudes.filter(s => s.estado === 'Finalizado').length;

    let lista = solicitudes;
    if (filtroEstado !== 'todos') lista = lista.filter(s => s.estado === filtroEstado);

    const tarjetaMantenimientos = document.querySelector('#admin-main .card.card-custom:first-of-type, #admin-main .card:first-of-type');
    if (tarjetaMantenimientos) {
        const headerCard = tarjetaMantenimientos.querySelector('.card-header');
        if (headerCard) {
            headerCard.innerHTML = `
                <span><i class="fa-solid fa-list-check me-2"></i> Registro de Mantenimientos - Clientes y Autos</span>
                <span class="small fw-normal">Control y Edición</span>
            `;
        }
    }

    const tbody = document.getElementById('tabla-admin-solicitudes');
    if (tbody) {
        tbody.innerHTML = '';
        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No se encontraron solicitudes.</td></tr>`;
        } else {
            lista.forEach(item => {
                let badgeEstadoColor = 'bg-warning text-dark';
                if (item.estado === 'Finalizado') badgeEstadoColor = 'bg-success text-white';
                if (item.estado === 'Cancelado') badgeEstadoColor = 'bg-danger text-white';

                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold"><span class="badge bg-dark">${item.id}</span><br><small class="text-muted">${item.fechaCita}</small></td>
                        <td><strong>${item.clienteNombre}</strong><br><small class="text-muted">${item.clienteTelefono} - ${item.clienteCorreo}</small></td>
                        <td><strong>${item.marca} ${item.modelo}</strong><br><span class="badge bg-secondary">${item.placa}</span></td>
                        <td>${item.servicio}<br><span class="badge ${badgeEstadoColor}">${item.estado}</span></td>
                        <td class="text-center">
                            <div class="d-flex justify-content-center align-items-center gap-2">
                                <button onclick="abrirEditarSolicitudAdminModal('${item.id}')" class="btn btn-sm text-white fw-bold px-2 py-1" style="background-color: var(--color-cafe-oscuro);" title="Editar Estado y Mensaje">
                                    <i class="fa-solid fa-pen-to-square me-1"></i> Editar
                                </button>
                                <button onclick="eliminarSolicitudAdmin('${item.id}')" class="btn btn-sm btn-outline-danger px-2 py-1" title="Eliminar">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    }
}

window.abrirEditarSolicitudAdminModal = function(id) {
    const solicitudes = obtenerSolicitudes();
    const item = solicitudes.find(s => s.id === id);
    if (!item) return;

    Swal.fire({
        title: `<i class="fa-solid fa-screwdriver-wrench text-warning me-2"></i> Gestionar Taller: ${item.id}`,
        width: '600px',
        html: `
            <div class="text-start small">
                <p class="text-muted mb-2">Cliente: <strong>${item.clienteNombre}</strong> (${item.marca} ${item.modelo} - Placa: <strong>${item.placa}</strong>)</p>
                <div class="mb-3">
                    <label class="form-label fw-bold">Estado actual en Taller:</label>
                    <select id="modal-admin-estado" class="form-select">
                        <option value="Llevado al taller" ${item.estado === 'Llevado al taller' ? 'selected' : ''}>🚗 Llevado al taller</option>
                        <option value="Revisando" ${item.estado === 'Revisando' ? 'selected' : ''}>🔍 Revisando</option>
                        <option value="En mantenimiento" ${item.estado === 'En mantenimiento' ? 'selected' : ''}>⚙️ En mantenimiento</option>
                        <option value="Lavado y control" ${item.estado === 'Lavado y control' ? 'selected' : ''}>🧼 Lavado y control</option>
                        <option value="Finalizado" ${item.estado === 'Finalizado' ? 'selected' : ''}>✅ Finalizado</option>
                        <option value="Cancelado" ${item.estado === 'Cancelado' ? 'selected' : ''}>❌ Cancelado</option>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-bold"><i class="fa-solid fa-message me-1"></i> Enviar Mensaje / Nota Técnica al Cliente:</label>
                    <textarea id="modal-admin-mensaje" class="form-control" rows="3" placeholder="Escribe aquí el avance o mensaje para el cliente...">${item.observaciones || ''}</textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#4a2c1a',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Guardar y Enviar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nuevoEstado = document.getElementById('modal-admin-estado').value;
            const nuevoMensaje = document.getElementById('modal-admin-mensaje').value.trim();
            return { nuevoEstado, nuevoMensaje };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { nuevoEstado, nuevoMensaje } = result.value;
            item.estado = nuevoEstado;
            item.observaciones = nuevoMensaje;
            guardarSolicitudes(solicitudes);

            renderizarDashboardAdmin();
            Swal.fire({
                icon: 'success',
                title: '¡Actualizado con éxito!',
                text: 'El estado y el mensaje del taller han sido guardados.',
                confirmButtonColor: '#4a2c1a',
                timer: 2000
            });
        }
    });
};

function eliminarSolicitudAdmin(id) {
    Swal.fire({
        title: '¿Eliminar registro?',
        text: `¿Deseas eliminar la solicitud ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(res => {
        if (res.isConfirmed) {
            const solicitudes = obtenerSolicitudes().filter(s => s.id !== id);
            guardarSolicitudes(solicitudes);
            renderizarDashboardAdmin();
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'La solicitud ha sido eliminada del sistema.',
                timer: 1300,
                showConfirmButton: false
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarAlmacenamiento();
    actualizarBarraNavegacion();
    if (document.getElementById('form-mantenimiento'))      inicializarPaginaSolicitudes();
    if (document.getElementById('seccion-login'))           inicializarPaginaCuenta();
    if (document.getElementById('tabla-admin-solicitudes')) inicializarPaginaAdmin();
});
