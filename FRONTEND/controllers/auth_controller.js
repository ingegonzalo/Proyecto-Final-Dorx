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
