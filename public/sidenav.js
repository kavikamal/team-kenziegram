//sidenav trigger 
document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('.sidenav');
    const options ={};
    let instances = M.Sidenav.init(elems, options);
})