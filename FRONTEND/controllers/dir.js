const local_url = "http://localhost:3000/";

if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        function validateLogin(){
            try {
                const doctor = sessionStorage.getItem('doctor');
                if(!doctor && window.location.href !== local_url){
                    alert("Por favor inicie sesión primero");
                    window.location.href = local_url;
                    return;
                }
                if(doctor && window.location.href === local_url){
                    window.location.href = local_url + "home.html";
                }
            } catch (error) {
                console.error("Error validating login:", error);
            }
        }

        validateLogin();
    });
}