const STORAGE_KEYS = {
  activity: "troncosport_activity",
  authUsers: "troncosport_auth_users",
  session: "troncosport_session",
};

const API_BASE_URL = "http://localhost:8080";
const PRODUCTOS_API_URL = `${API_BASE_URL}/api/productos`;
const USUARIOS_API_URL = `${API_BASE_URL}/api/usuarios`;

let productCache = [];
let userCache = [];

const seedActivity = [
  "Ingreso inicial de referencias deportivas al sistema.",
  "Actualizacion de precios para la coleccion Training 2026.",
  "Revision de alertas por stock bajo en pantalonetas.",
];

function readStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.activity)) {
    writeStorage(STORAGE_KEYS.activity, seedActivity);
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && data.mensaje ? data.mensaje : "No se pudo completar la peticion.";
    throw new Error(message);
  }

  return data;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function setMessage(element, text, type = "") {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("is-success", "is-error");

  if (type) {
    element.classList.add(type === "success" ? "is-success" : "is-error");
  }
}

function getStatusByStock(stock, selectedStatus) {
  const numericStock = Number(stock);

  if (numericStock <= 0) {
    return "Agotado";
  }

  if (numericStock <= 8) {
    return selectedStatus === "Disponible" ? "Stock bajo" : selectedStatus;
  }

  return selectedStatus === "Agotado" ? "Disponible" : selectedStatus;
}

function toFrontendProduct(product) {
  return {
    id: String(product.id),
    name: product.nombre,
    category: "General",
    size: "Unica",
    stock: product.stock,
    price: product.precio,
    supplier: "Backend Spring Boot",
    status: getStatusByStock(product.stock, "Disponible"),
    updatedAt: "API en memoria",
  };
}

function toProductRequest(payload) {
  return {
    nombre: payload.name,
    precio: payload.price,
    stock: payload.stock,
  };
}

async function loadUsersFromApi() {
  const userFormMessage = document.getElementById("userFormMessage");

  try {
    userCache = await requestJson(USUARIOS_API_URL);
    renderUsers();
    renderUserTable();
  } catch (error) {
    userCache = [];
    renderUsers();
    renderUserTable();
    setMessage(userFormMessage, `No se pudo conectar con usuarios: ${error.message}`, "error");
  }
}

async function loadProductsFromApi() {
  const formMessage = document.getElementById("formMessage");

  try {
    const products = await requestJson(PRODUCTOS_API_URL);
    productCache = products.map(toFrontendProduct);
    renderInventory();
  } catch (error) {
    productCache = [];
    renderInventory();
    setMessage(formMessage, `No se pudo conectar con el backend: ${error.message}`, "error");
  }
}

function renderUsers() {
  const list = document.getElementById("userList");
  if (!list) {
    return;
  }

  if (userCache.length === 0) {
    list.innerHTML = `
      <article class="user-card">
        <div class="user-card-header">
          <strong>Sin usuarios registrados</strong>
          <span class="status-badge status-stock-bajo">API</span>
        </div>
        <span class="user-role">Crea usuarios desde Postman usando /api/usuarios.</span>
      </article>
    `;
    return;
  }

  list.innerHTML = userCache
    .map(
      (user) => `
        <article class="user-card">
          <div class="user-card-header">
            <strong>${user.nombre}</strong>
            <span class="status-badge status-disponible">Activo</span>
          </div>
          <span class="user-role">${user.correo}</span>
          <span>Rol: ${user.rol || "Usuario"}</span>
          <span>Edad: ${user.edad}</span>
          <span>ID backend: ${user.id}</span>
        </article>
      `,
    )
    .join("");
}

function getFilteredUsers(users) {
  const searchInput = document.getElementById("userSearchInput");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!query) {
    return users;
  }

  return users.filter((user) => {
    return (
      user.nombre.toLowerCase().includes(query) ||
      user.correo.toLowerCase().includes(query)
    );
  });
}

function renderUserTable() {
  const tbody = document.getElementById("usersBody");
  if (!tbody) {
    return;
  }

  const totalUsers = document.getElementById("totalUsers");
  if (totalUsers) {
    totalUsers.textContent = String(userCache.length);
  }

  const filteredUsers = getFilteredUsers(userCache);

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">No se encontraron usuarios. Registra uno desde el formulario.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredUsers
    .map(
      (user) => `
        <tr>
        <td><strong>${user.nombre}</strong></td>
        <td>${user.correo}</td>
        <td>${user.edad}</td>
        <td><span class="status-badge status-disponible">${user.rol || "Usuario"}</span></td>
        <td>${user.id}</td>
        <td>
            <div class="action-group">
              <button class="table-action edit" type="button" data-user-action="edit" data-id="${user.id}">Editar</button>
              <button class="table-action delete" type="button" data-user-action="delete" data-id="${user.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderActivity() {
  const list = document.getElementById("activityList");
  if (!list) {
    return;
  }

  const activity = readStorage(STORAGE_KEYS.activity, seedActivity);
  list.innerHTML = activity.map((item) => `<li>${item}</li>`).join("");
}

function updateStats(products) {
  const totalProducts = document.getElementById("totalProducts");
  const totalStock = document.getElementById("totalStock");
  const lowStockCount = document.getElementById("lowStockCount");
  const inventoryValue = document.getElementById("inventoryValue");

  if (!totalProducts) {
    return;
  }

  const stockCount = products.reduce((sum, product) => sum + Number(product.stock), 0);
  const lowStock = products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 8).length;
  const totalValue = products.reduce(
    (sum, product) => sum + Number(product.stock) * Number(product.price),
    0,
  );

  totalProducts.textContent = String(products.length);
  totalStock.textContent = String(stockCount);
  lowStockCount.textContent = String(lowStock);
  inventoryValue.textContent = formatCurrency(totalValue);
  renderDashboardCharts(products);
}

function renderDashboardCharts(products) {
  const stockBars = document.getElementById("stockBars");
  const stockDonut = document.getElementById("stockDonut");
  const stockDonutValue = document.getElementById("stockDonutValue");
  const usersDonut = document.getElementById("usersDonut");
  const usersDonutValue = document.getElementById("usersDonutValue");

  if (!stockBars || !stockDonut || !stockDonutValue || !usersDonut || !usersDonutValue) {
    return;
  }

  const availableProducts = products.filter((product) => product.status === "Disponible").length;
  const healthyPercent = products.length === 0 ? 0 : Math.round((availableProducts / products.length) * 100);
  const userPercent = Math.min(userCache.length * 12, 100);

  stockDonut.style.setProperty("--value", `${healthyPercent}%`);
  stockDonutValue.textContent = `${healthyPercent}%`;
  usersDonut.style.setProperty("--value", `${userPercent}%`);
  usersDonutValue.textContent = String(userCache.length);

  const topProducts = [...products]
    .sort((a, b) => Number(b.stock) - Number(a.stock))
    .slice(0, 5);
  const maxStock = Math.max(...topProducts.map((product) => Number(product.stock)), 1);

  if (topProducts.length === 0) {
    stockBars.innerHTML = `
      <div class="bar-row">
        <span>Referencias</span>
        <div class="bar-track"><div class="bar-fill bar-empty" style="width: 6%"></div></div>
        <strong>0</strong>
      </div>
      <div class="bar-row">
        <span>Unidades</span>
        <div class="bar-track"><div class="bar-fill bar-empty" style="width: 6%"></div></div>
        <strong>0</strong>
      </div>
      <div class="bar-row">
        <span>Alertas</span>
        <div class="bar-track"><div class="bar-fill bar-empty" style="width: 6%"></div></div>
        <strong>0</strong>
      </div>
    `;
    return;
  }

  stockBars.innerHTML = topProducts
    .map((product) => {
      const percent = Math.max(6, Math.round((Number(product.stock) / maxStock) * 100));
      return `
        <div class="bar-row">
          <span>${product.name}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${percent}%"></div>
          </div>
          <strong>${product.stock}</strong>
        </div>
      `;
    })
    .join("");
}

function getFilteredProducts(products) {
  const searchInput = document.getElementById("searchInput");
  const filterStatus = document.getElementById("filterStatus");

  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const status = filterStatus ? filterStatus.value : "Todos";

  return products.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.supplier.toLowerCase().includes(query);

    const matchesStatus = status === "Todos" || product.status === status;
    return matchesQuery && matchesStatus;
  });
}

function getStatusClass(status) {
  if (status === "Disponible") {
    return "status-disponible";
  }

  if (status === "Stock bajo") {
    return "status-stock-bajo";
  }

  return "status-agotado";
}

function renderInventory() {
  const tbody = document.getElementById("inventoryBody");
  updateStats(productCache);

  if (!tbody) {
    return;
  }

  const filteredProducts = getFilteredProducts(productCache);

  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">No se encontraron productos. Registra uno desde el formulario o revisa el backend.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredProducts
    .map(
      (product) => `
        <tr>
          <td><strong>${product.name}</strong><br><small>${product.id}</small></td>
          <td>${product.category}</td>
          <td>${product.size}</td>
          <td>${product.stock}</td>
          <td>${formatCurrency(product.price)}</td>
          <td>${product.supplier}</td>
          <td><span class="status-badge ${getStatusClass(product.status)}">${product.status}</span></td>
          <td>${product.updatedAt}</td>
          <td>
            <div class="action-group">
              <button class="table-action edit" type="button" data-action="edit" data-id="${product.id}">Editar</button>
              <button class="table-action delete" type="button" data-action="delete" data-id="${product.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function resetForm() {
  const form = document.getElementById("inventoryForm");
  const productId = document.getElementById("productId");
  const submitButton = document.getElementById("submitButton");

  if (!form || !productId || !submitButton) {
    return;
  }

  form.reset();
  productId.value = "";
  submitButton.textContent = "Guardar producto";
}

function resetUserForm() {
  const form = document.getElementById("userForm");
  const userId = document.getElementById("userId");
  const submitButton = document.getElementById("userSubmitButton");

  if (!form || !userId || !submitButton) {
    return;
  }

  form.reset();
  userId.value = "";
  submitButton.textContent = "Guardar usuario";
}

function registerActivity(message) {
  const activity = readStorage(STORAGE_KEYS.activity, seedActivity);
  activity.unshift(message);
  writeStorage(STORAGE_KEYS.activity, activity.slice(0, 5));
  renderActivity();
}

async function saveProduct(event) {
  event.preventDefault();

  const formMessage = document.getElementById("formMessage");
  const productId = document.getElementById("productId").value.trim();
  const name = document.getElementById("productName").value.trim();
  const stock = Number(document.getElementById("stock").value);
  const price = Number(document.getElementById("price").value);

  const payload = {
    name,
    stock,
    price,
  };

  try {
    if (productId) {
      await requestJson(`${PRODUCTOS_API_URL}/${productId}`, {
        method: "PUT",
        body: JSON.stringify(toProductRequest(payload)),
      });
      setMessage(formMessage, "Producto actualizado correctamente.", "success");
      registerActivity(`Se actualizo la referencia ${productId} - ${name}.`);
    } else {
      const createdProduct = await requestJson(PRODUCTOS_API_URL, {
        method: "POST",
        body: JSON.stringify(toProductRequest(payload)),
      });
      setMessage(formMessage, "Producto registrado correctamente.", "success");
      registerActivity(`Se registro la nueva referencia ${createdProduct.id} - ${createdProduct.nombre}.`);
    }

    resetForm();
    await loadProductsFromApi();
  } catch (error) {
    setMessage(formMessage, error.message, "error");
  }
}

async function handleTableAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (!action || !id) {
    return;
  }

  const product = productCache.find((item) => item.id === id);
  const formMessage = document.getElementById("formMessage");

  if (!product) {
    return;
  }

  if (action === "edit") {
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("category").value = product.category;
    document.getElementById("size").value = product.size;
    document.getElementById("stock").value = product.stock;
    document.getElementById("price").value = product.price;
    document.getElementById("supplier").value = product.supplier;
    document.getElementById("status").value = product.status;
    document.getElementById("submitButton").textContent = "Actualizar producto";
    setMessage(formMessage, `Editando la referencia ${product.id}.`, "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Deseas eliminar la referencia ${product.id} - ${product.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      await requestJson(`${PRODUCTOS_API_URL}/${id}`, {
        method: "DELETE",
      });
      setMessage(formMessage, `Se elimino la referencia ${product.id}.`, "success");
      registerActivity(`Se elimino la referencia ${product.id} - ${product.name}.`);
      resetForm();
      await loadProductsFromApi();
    } catch (error) {
      setMessage(formMessage, error.message, "error");
    }
  }
}

async function saveUser(event) {
  event.preventDefault();

  const userFormMessage = document.getElementById("userFormMessage");
  const userId = document.getElementById("userId").value.trim();
  const nombre = document.getElementById("userName").value.trim();
  const correo = document.getElementById("userEmail").value.trim();
  const edad = Number(document.getElementById("userAge").value);
  const rol = document.getElementById("userRole").value;

  const payload = {
    nombre,
    correo,
    edad,
    rol,
  };

  try {
    if (userId) {
      await requestJson(`${USUARIOS_API_URL}/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setMessage(userFormMessage, "Usuario actualizado correctamente.", "success");
      registerActivity(`Se actualizo el usuario ${userId} - ${nombre}.`);
    } else {
      const createdUser = await requestJson(USUARIOS_API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage(userFormMessage, "Usuario registrado correctamente.", "success");
      registerActivity(`Se registro el usuario ${createdUser.id} - ${createdUser.nombre}.`);
    }

    resetUserForm();
    await loadUsersFromApi();
  } catch (error) {
    setMessage(userFormMessage, error.message, "error");
  }
}

async function handleUserTableAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.userAction;
  const id = target.dataset.id;

  if (!action || !id) {
    return;
  }

  const user = userCache.find((item) => String(item.id) === String(id));
  const userFormMessage = document.getElementById("userFormMessage");

  if (!user) {
    return;
  }

  if (action === "edit") {
    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.nombre;
    document.getElementById("userEmail").value = user.correo;
    document.getElementById("userAge").value = user.edad;
    document.getElementById("userRole").value = user.rol || "Usuario";
    document.getElementById("userSubmitButton").textContent = "Actualizar usuario";
    setMessage(userFormMessage, `Editando el usuario ${user.id}.`, "success");
    document.getElementById("users").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Deseas eliminar el usuario ${user.id} - ${user.nombre}?`);
    if (!confirmed) {
      return;
    }

    try {
      await requestJson(`${USUARIOS_API_URL}/${id}`, {
        method: "DELETE",
      });
      setMessage(userFormMessage, `Se elimino el usuario ${user.id}.`, "success");
      registerActivity(`Se elimino el usuario ${user.id} - ${user.nombre}.`);
      resetUserForm();
      await loadUsersFromApi();
    } catch (error) {
      setMessage(userFormMessage, error.message, "error");
    }
  }
}

function initIndexPage() {
  localStorage.removeItem(STORAGE_KEYS.session);

  const form = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const message = document.getElementById("loginMessage");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const showLogin = document.getElementById("showLogin");
  const showRegister = document.getElementById("showRegister");
  const registerName = document.getElementById("registerName");
  const registerEmail = document.getElementById("registerEmail");
  const registerAge = document.getElementById("registerAge");
  const registerPassword = document.getElementById("registerPassword");

  function clearLoginFields() {
    username.value = "";
    password.value = "";
  }

  function setAuthMode(mode) {
    const isLogin = mode === "login";
    form.classList.toggle("is-active", isLogin);
    registerForm.classList.toggle("is-active", !isLogin);
    showLogin.classList.toggle("is-active", isLogin);
    showRegister.classList.toggle("is-active", !isLogin);
    setMessage(message, isLogin ? "Ingresa con tu usuario registrado." : "Crea tu usuario en la API.");
  }

  function startSession(userValue, role = "Usuario", email = "") {
    writeStorage(STORAGE_KEYS.session, {
      user: userValue,
      role,
      email,
    });
    setMessage(message, "Acceso concedido.", "success");
    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);
  }

  async function login(userValue, passwordValue) {
    const normalizedUser = userValue.toLowerCase();
    const authUsers = readStorage(STORAGE_KEYS.authUsers, []);
    const registeredUser = authUsers.find((user) => {
      return (
        user.correo.toLowerCase() === normalizedUser ||
        user.nombre.toLowerCase() === normalizedUser
      );
    });

    if (registeredUser && registeredUser.password === passwordValue) {
      startSession(registeredUser.nombre, registeredUser.rol || "Usuario", registeredUser.correo);
      return;
    }

    setMessage(message, "Primero debes crear un usuario o verificar tus datos.", "error");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    login(username.value.trim(), password.value.trim());
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      nombre: registerName.value.trim(),
      correo: registerEmail.value.trim(),
      edad: Number(registerAge.value),
      rol: "Usuario",
    };

    try {
      const createdUser = await requestJson(USUARIOS_API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const authUsers = readStorage(STORAGE_KEYS.authUsers, []);
      writeStorage(STORAGE_KEYS.authUsers, [
        ...authUsers.filter((user) => user.correo.toLowerCase() !== createdUser.correo.toLowerCase()),
        {
          nombre: createdUser.nombre,
          correo: createdUser.correo,
          rol: createdUser.rol || "Usuario",
          password: registerPassword.value,
        },
      ]);
      setMessage(message, "Usuario creado.", "success");
      startSession(createdUser.nombre, createdUser.rol || "Usuario", createdUser.correo);
    } catch (error) {
      setMessage(message, error.message, "error");
    }
  });

  showLogin.addEventListener("click", () => setAuthMode("login"));
  showRegister.addEventListener("click", () => setAuthMode("register"));
  clearLoginFields();
  window.setTimeout(clearLoginFields, 100);
  window.setTimeout(clearLoginFields, 500);
}

function setupAuthenticatedHeader() {
  const session = readStorage(STORAGE_KEYS.session, null);
  const authUsers = readStorage(STORAGE_KEYS.authUsers, []);
  const sessionUserExists = session && authUsers.some((user) => {
    return (
      user.correo.toLowerCase() === String(session.email || "").toLowerCase() ||
      user.nombre.toLowerCase() === String(session.user || "").toLowerCase()
    );
  });

  if (!session || !sessionUserExists) {
    localStorage.removeItem(STORAGE_KEYS.session);
    window.location.href = "index.html";
    return null;
  }

  const currentUser = document.getElementById("currentUser");
  if (currentUser) {
    currentUser.textContent = session.user;
  }

  const currentRole = document.getElementById("currentRole");
  if (currentRole) {
    currentRole.textContent = `Rol: ${session.role}`;
  }

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.session);
      window.location.href = "index.html";
    });
  }

  return session;
}

function setupUserCrudEvents() {
  const userForm = document.getElementById("userForm");
  const userResetButton = document.getElementById("userResetButton");
  const usersTable = document.getElementById("usersTable");
  const userSearchInput = document.getElementById("userSearchInput");

  if (userForm) {
    userForm.addEventListener("submit", saveUser);
  }

  if (userResetButton) {
    userResetButton.addEventListener("click", () => {
      resetUserForm();
      setMessage(
        document.getElementById("userFormMessage"),
        "Formulario limpio. Puedes registrar un nuevo usuario.",
        "success",
      );
    });
  }

  if (usersTable) {
    usersTable.addEventListener("click", handleUserTableAction);
  }

  if (userSearchInput) {
    userSearchInput.addEventListener("input", renderUserTable);
  }
}

async function initDashboardPage() {
  const session = setupAuthenticatedHeader();
  if (!session) {
    return;
  }

  renderActivity();
  await loadUsersFromApi();
  await loadProductsFromApi();
}

async function initInventoryPage() {
  const session = setupAuthenticatedHeader();
  if (!session) {
    return;
  }

  const form = document.getElementById("inventoryForm");
  const resetButton = document.getElementById("resetButton");
  const table = document.getElementById("inventoryTable");
  const searchInput = document.getElementById("searchInput");
  const filterStatus = document.getElementById("filterStatus");

  form.addEventListener("submit", saveProduct);
  resetButton.addEventListener("click", () => {
    resetForm();
    setMessage(
      document.getElementById("formMessage"),
      "Formulario limpio. Puedes registrar una nueva referencia.",
      "success",
    );
  });
  table.addEventListener("click", handleTableAction);
  searchInput.addEventListener("input", renderInventory);
  filterStatus.addEventListener("change", renderInventory);

  await loadProductsFromApi();
}

async function initUsersPage() {
  const session = setupAuthenticatedHeader();
  if (!session) {
    return;
  }

  setupUserCrudEvents();
  await loadUsersFromApi();
}

async function main() {
  initializeData();

  const page = document.body.dataset.page;

  if (page === "index") {
    initIndexPage();
  }

  if (page === "dashboard") {
    await initDashboardPage();
  }

  if (page === "inventario") {
    await initInventoryPage();
  }

  if (page === "usuarios") {
    await initUsersPage();
  }
}

document.addEventListener("DOMContentLoaded", main);
