//sidenav trigger 
document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('.sidenav');
    const options ={};
    let instances = M.Sidenav.init(elems, options);
})
document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('.materialboxed');
    const options ={};
    let instances = M.Materialbox.init(elems, options);
  });

//parallax 
document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('.parallax');
    const options ={};
    let instances = M.Parallax.init(elems, options);
  });

