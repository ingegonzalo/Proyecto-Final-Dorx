const API_URL = 'http://localhost:3000/api/doctors';

function toggleForms(){
    let form_login = document.getElementById("form_login");
    let form_register = document.getElementById("form_register");

    if(form_register.style.display == 'none'){
        form_login.style.display = 'none';
        form_register.style.display = 'block';
    }else{
        form_login.style.display = 'block';
        form_register.style.display = 'none';
    }
}

// Login function
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;

    try {
        // Fetch all doctors from the API
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Error al conectar con el servidor');
        }

        const doctors = await response.json();
        
        // Find doctor with matching email and password
        const doctor = doctors.find(doc => doc.email === email && doc.password === password);
        
        if (doctor) {
            // Store doctor info in sessionStorage
            sessionStorage.setItem('doctorId', doctor.id);
            sessionStorage.setItem('doctorName', doctor.name);
            sessionStorage.setItem('doctorEmail', doctor.email);
            
            // Redirect to home
            window.location.href = 'home.html';
        } else {
            alert('Correo y/o Contraseña Incorrectos');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al intentar iniciar sesión. Por favor intenta nuevamente.');
    }
}

// Validate password match in real-time
function validatePasswordMatch() {
    const password = document.getElementById('register_password').value;
    const confirm_password = document.getElementById('confirm_Password').value;
    const errorDiv = document.getElementById('password-error');
    
    if (confirm_password && password !== confirm_password) {
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

// Register function
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register_name').value;
    const email = document.getElementById('register_email').value;
    const password = document.getElementById('register_password').value;
    const confirm_password = document.getElementById('confirm_Password').value;

    // Validate password confirmation
    if (password !== confirm_password) {
        document.getElementById('password-error').style.display = 'block';
        return;
    }

    try {
        // Create doctor object
        const doctorData = {
            name: name,
            email: email,
            password: password,
            confirm_password: confirm_password,
            patients: [],
            appointments: []
        };

        // Send POST request to create doctor
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctorData)
        });

        const data = await response.json();

        if (response.ok) {
            // Store doctor info in sessionStorage
            sessionStorage.setItem('doctorId', data.doctor.id);
            sessionStorage.setItem('doctorName', data.doctor.name);
            sessionStorage.setItem('doctorEmail', data.doctor.email);
            
            // Redirect to home
            window.location.href = 'home.html';
        } else {
            alert(data.error || 'Error al registrarse');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al intentar registrarse. Por favor intenta nuevamente.');
    }
}

// Logout function
function handleLogout() {
    // Clear all session storage
    sessionStorage.clear();
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('form_login');
    const registerForm = document.getElementById('form_register');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Add real-time validation for password confirmation
        const confirmPasswordInput = document.getElementById('confirm_Password');
        const passwordInput = document.getElementById('register_password');
        
        if (confirmPasswordInput && passwordInput) {
            confirmPasswordInput.addEventListener('input', validatePasswordMatch);
            passwordInput.addEventListener('input', validatePasswordMatch);
        }
    }

    // Add logout event listeners only to modal logout buttons
    const logoutButtons = document.querySelectorAll('#btn-logout');
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });
});
