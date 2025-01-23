// Lista de IMEIs
let imeiList = [];
let exportHistory = []; // Historial de exportaciones

// Función de inicio de sesión
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "ShadowX@05" && password === "Damian") {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("container").style.display = "block";
    } else {
        document.getElementById("login-error").style.display = "block";
    }
}

// Función para alternar el menú lateral
function toggleMenu() {
    const sideMenu = document.getElementById("side-menu");
    sideMenu.classList.toggle("show");
}

// Función para mostrar y ocultar el historial
function showHistory() {
    const historyMenu = document.getElementById("history-menu");
    historyMenu.style.display = (historyMenu.style.display === "none" || historyMenu.style.display === "")
      ? "block" 
      : "none";
}

// Función para agregar IMEI (por teclado, al presionar Enter)
function addIMEI(event) {
    if (event.key === "Enter") {
        const imeiInput = document.getElementById("imei-input");
        const imei = imeiInput.value.trim();

        if (imei) {
            // Agregamos el nuevo IMEI
            imeiList.push(imei);

            // Eliminar duplicados inmediatamente
            removeDuplicates();

            // Actualizar en pantalla
            displayIMEIs();
            imeiInput.value = '';
            updateCounter();
        }
    }
}

// Función para mostrar la lista de IMEIs
function displayIMEIs() {
    const imeiListContainer = document.getElementById("imei-list");
    imeiListContainer.innerHTML = '';
    imeiList.forEach(imei => {
        const div = document.createElement("div");
        div.textContent = imei;
        imeiListContainer.appendChild(div);
    });
}

// Función para actualizar el contador de IMEIs y S/N
function updateCounter() {
    const counterElement = document.getElementById("counter");
    counterElement.textContent = `Registros (IMEIs y S/N) Escaneados: ${imeiList.length}`;
}

// Función para exportar la lista a Excel y registrar en el historial
function exportToExcel() {
    const fileName = prompt("Ingrese el nombre para el archivo:", "IMEI_List");
    if (!fileName) return;

    // Crear un libro de Excel
    const wb = XLSX.utils.book_new();
    // Crear la hoja de Excel a partir de imeiList
    const ws = XLSX.utils.aoa_to_sheet(imeiList.map(imei => [imei]));
    XLSX.utils.book_append_sheet(wb, ws, "IMEIs");

    // Descargar el archivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    // Agregar el evento al historial
    const date = new Date();
    exportHistory.push(`${fileName}.xlsx - ${date.toLocaleString()}`);
    updateHistory();
}

// Función para limpiar la lista
function clearList() {
    imeiList = [];
    displayIMEIs();
    updateCounter();
}

// Función para eliminar duplicados en la lista
function removeDuplicates() {
    // new Set() extrae solo los valores únicos
    imeiList = [...new Set(imeiList)];
}

// Función para actualizar el historial en el menú
function updateHistory() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = '';
    exportHistory.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = entry;
        historyList.appendChild(li);
    });
}

/* 
 * -------------------------------------------
 *     NUEVO: Importar/leer archivo Excel
 * -------------------------------------------
 */
function importFromExcel() {
    // Simulamos clic en el input "file" oculto para que el usuario elija su archivo
    const fileInput = document.getElementById("excelFileInput");
    fileInput.click();

    // Cuando el usuario seleccione el archivo, se ejecutará el evento "change"
    fileInput.onchange = function () {
        if (fileInput.files.length === 0) {
            alert("No se seleccionó ningún archivo.");
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        // Evento que se dispara cuando se termina de leer el archivo
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                // Leemos el workbook usando SheetJS
                const workbook = XLSX.read(data, { type: "array" });
                
                // Asumimos que queremos la primera hoja
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Con sheet_to_json, { header: 1 } nos da un array de arrays
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // "rows" es un array bidimensional. Cada subarray es una fila del Excel
                // y rows[i][0] sería el valor de la primera columna de la fila i.
                rows.forEach(row => {
                    // row[0] = IMEI en la primera columna (ajustar si tu archivo usa otra)
                    if (row[0]) {
                        const imei = String(row[0]).trim();
                        imeiList.push(imei);
                    }
                });

                // Al terminar de importar, removemos duplicados y actualizamos vista
                removeDuplicates();
                displayIMEIs();
                updateCounter();

                // Limpia la selección de archivo para evitar problemas si el usuario
                // vuelve a importar el mismo archivo
                fileInput.value = "";
                
            } catch (error) {
                alert("Error al leer el archivo: " + error);
            }
        };

        // Leemos el archivo como ArrayBuffer para poder procesarlo con XLSX
        reader.readAsArrayBuffer(file);
    };
}
