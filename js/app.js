document.addEventListener('DOMContentLoaded', iniciarApp);

const selectCategorias = document.querySelector('#categorias');
if (selectCategorias) {
    selectCategorias.addEventListener('change', seleccionarCategoria);
}

const resultado = document.querySelector('#resultado');

const botonFavorito = document.querySelector('#button-favorito');

// Bootstrap se carga en la ventana Global, por lo que si coloco bootstrap en consola puedo ver las 
// opciones disponibles:
const modal = new bootstrap.Modal('#modal', {});

const favoritosDiv = document.querySelector('.favoritos');




// ------------- APARTADO FUNCIONES -------------

// METODO: función para iniciar app, cargar las categorias de comida
function iniciarApp() {
    if (selectCategorias) {
        obtenerCategorias();
    }

    if (favoritosDiv) {
        obtenerFavoritos();
    }
}


// METODO: función para obtener las categorias de la API
function obtenerCategorias() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarCategorias(resultado.categories))
        .catch(error => console.log(error))
}


// METODO: mostrar las categorias que se obtuvieron de la API
function mostrarCategorias(categorias = []) {
    categorias.forEach( categoria => {
        const { strCategory } = categoria
        const option = document.createElement('OPTION');
        option.value = strCategory
        option.textContent = strCategory
        selectCategorias.appendChild(option)
    })
}


// METODO: obtener las comidas que incluye una categoria seleccionada
function seleccionarCategoria(e) {
    const categoria = e.target.value;
    const url =  `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarRecetas(resultado.meals))
        .catch(error => console.log(error))
}


// METODO: mostrar las comidas (platos o platillos) que incluye una categoria seleccionada
function mostrarRecetas(recetas = []) {
    // Limpio el html previo
    limpiarHTML(resultado);

    // Creo un heading o título
    const heading = document.createElement('H2');
    heading.classList.add('text-center', 'text-black', 'my-5');
    heading.textContent = recetas.length ? 'Recetas Disponibles' : 'No hay recestas disponibles'

    resultado.appendChild(heading);
 

    // Iterar resultados para crear cards con Bootstrap
    recetas.forEach( receta => {
        // console.log(receta);  para ver que tengo
        const { idMeal, strMeal, strMealThumb } = receta;

        // Scripting
        const recetaContenedor = document.createElement('DIV');
        recetaContenedor.classList.add('col-md-4');

        const recetaCard = document.createElement('DIV');
        recetaCard.classList.add('card', 'mb-4');

        const recetaImagen = document.createElement('IMG');
        recetaImagen.classList.add('card-img-top')
        recetaImagen.alt = `Imágen de la receta ${strMeal ?? receta.titulo}`
        recetaImagen.src = strMealThumb ?? receta.img;

        const recetaCardBody = document.createElement('DIV');
        recetaCardBody.classList.add('card-body');

        const recetaHeading = document.createElement('H3');
        recetaHeading.classList.add('card-title', 'mb-3');
        recetaHeading.textContent = strMeal ?? receta.titulo;

        const recetaButton = document.createElement('BUTTON');
        recetaButton.classList.add('btn', 'btn-danger', 'w-100');
        recetaButton.textContent = 'Ver Receta';
        // recetaButton.dataset.bsTarget = "#modal";
        // recetaButton.dataset.bsToggle = "modal";
        recetaButton.onclick = function() {
            seleccionarReceta(idMeal ?? receta.id);
        }


        // Renderizar o inyectar en el código HTML
        recetaCardBody.appendChild(recetaHeading);
        recetaCardBody.appendChild(recetaButton);

        recetaCard.appendChild(recetaImagen);
        recetaCard.appendChild(recetaCardBody);

        recetaContenedor.appendChild(recetaCard);

        resultado.appendChild(recetaContenedor);
    })  
}


// METODO: función para limpiar HTML previo
function limpiarHTML(selector) {
    while(selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
}


// METODO: función para obetener el detalle de una comida según su id
function seleccionarReceta(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarRecetaModal(resultado.meals[0]))
        .catch(error => console.log(error))
}


// METODO: función para mostrar que contiene cada receta. Lo muestro en un modal
function mostrarRecetaModal(receta) {    
    const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

    // Añadir contenido al modal
    // const modalContent = document.querySelector('.modal-content');
    const modalTitle = document.querySelector('.modal .modal-title');
    const modalBody = document.querySelector('.modal .modal-body');
    // const modalHeader = document.querySelector('.modal-header');

    // Limpio una consulta existente previa
    limpiarHTML(modalBody)

    // Título del Modal
    modalTitle.textContent = strMeal;

    // Titulo de Instrucciones
    const tituloSeccionInstrucciones = document.createElement('H3');
    tituloSeccionInstrucciones.classList.add('my-3');
    tituloSeccionInstrucciones.textContent = 'Instrucciones y Comentarios';

    // Body, instrucciones, imágen
    const p = document.createElement('P');
    p.textContent = (strInstructions)
    
    const modalImagen = document.createElement('IMG');
    modalImagen.classList.add('img-fluid', 'mb-4');
    modalImagen.alt = `Imágen de la receta ${strMeal}`
    modalImagen.src = strMealThumb;

    // modalBody.insertBefore(tituloSeccionInstrucciones, p);
    modalBody.appendChild(modalImagen);
    modalBody.appendChild(p);
    modalBody.insertBefore(tituloSeccionInstrucciones, p);

    // Mostrar ingredientes y cantidades
    const tituloSeccionIngrediente = document.createElement('H3');
    tituloSeccionIngrediente.classList.add('my-3');
    tituloSeccionIngrediente.textContent = 'Ingredientes y Cantidades';

    const listGroup = document.createElement('UL'); 
    listGroup.classList.add('list-group');

    for (let i = 1; i <= 20; i++) {
        if (receta[`strIngredient${i}`]) {
            const ingrediente = receta[`strIngredient${i}`]   
            const cantidad = receta[`strMeasure${i}`]

            const ingredienteLi = document.createElement('LI');
            ingredienteLi.classList.add('list-group-item');
            ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

            listGroup.appendChild(ingredienteLi);
        }        
    }

    modalBody.appendChild(tituloSeccionIngrediente, listGroup);
    modalBody.appendChild(listGroup);

    // // VERIFICAR TEXTO BOTON FAVORITO Y GUARDAR/ELIMINAR FAVORITO EN STORAGE
    botonFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito'

    botonFavorito.onclick = function () {
        // OPCIÓN UNO: CON CONFIRM DE JAVASCRIPT
        //    if(existeStorage(idMeal)) {
        //         botonFavorito.textContent = 'Guardar Favorito';
        //         confirm(`La comida ${strMeal} está en tus favoritos. \n ¿Querés Eliminarla?`);

        //         if (confirm) {
        //             eliminarFavorito(idMeal)
        //             modal.hide();
        //             return;
        //         }
        //     }

        //     guardarFavorito({
        //         id: idMeal,
        //         titulo: strMeal,
        //         img: strMealThumb
        //     });

        //     botonFavorito.textContent = 'Eliminar Favorito';
      
        // OPCION DOS: CONFIRMACION TOAST DE BOOTSTRAP
        if (existeStorage(idMeal)) {
            eliminarFavorito(idMeal);
            // modal.hide();
            botonFavorito.textContent = 'Guardar Favorito';
            mostrarToast('Eliminado Correctamente');
            return;
        }

        guardarFavorito({
            id: idMeal,
            titulo: strMeal,
            img: strMealThumb
        })

        botonFavorito.textContent = 'Eliminar Favorito';
        mostrarToast('Agregado Correctamente');
    } 

    // Muestra el modal
    modal.show()
}



// METODO: función para mostar toast o alerta en Bootstrap
function mostrarToast(mensaje) {
    // Si coloco Bootstrap en consola del navegador me muestra API de Toast
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');

    const toast = new bootstrap.Toast(toastDiv);

    toastBody.textContent = mensaje;

    toast.show();
}


// ---------- FUNCIONES STORAGE ----------

// METODO: función para guardar esa receta en favoritos
// Colocar data en LocalStorage
function guardarFavorito(receta) {
    // La primera vez mi storage va a ser null osea por ?? un array vacío
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));   
}


// METODO: función para detectar si hay duplicados en mi storage
function existeStorage(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    return favoritos.some( favorito => favorito.id === id);
}


// METODO: función para elminar un elemento del storage
function eliminarFavorito(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    const nuevosFavoritos = favoritos.filter( favorito => favorito.id !== id );
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
}
// ---------- FIN FUNCIONES STORAGE ----------


// METODO: función para obtener favoritos en favoritos.html
function obtenerFavoritos() {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];    

    if (favoritos.length) {
        mostrarRecetas(favoritos);
        return;
    }
        
    const noFavoritos = document.createElement('P');
    noFavoritos.textContent = 'No hay favoritos aún';
    noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');

    favoritosDiv.appendChild(noFavoritos);
}