(function () {
  "use strict";

  var STORAGE_KEY = "inkopslista.varor";

  var form = document.getElementById("add-form");
  var input = document.getElementById("new-item");
  var listEl = document.getElementById("list");
  var emptyEl = document.getElementById("empty");
  var counterEl = document.getElementById("counter");
  var clearBtn = document.getElementById("clear-done");

  var items = load();

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(data)) {
        return data.filter(function (item) {
          return item && typeof item.namn === "string";
        });
      }
    } catch (e) {
      // Lagringen är blockerad eller trasig – börja med en tom lista.
    }
    return [];
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // Kunde inte spara (t.ex. privat läge) – appen fungerar ändå tills sidan laddas om.
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function render() {
    // Ej avbockade först, avbockade sist. Ordningen inom varje grupp behålls.
    var sorted = items.filter(function (i) { return !i.klar; })
      .concat(items.filter(function (i) { return i.klar; }));

    listEl.textContent = "";
    sorted.forEach(function (item) {
      listEl.appendChild(renderItem(item));
    });

    var left = items.filter(function (i) { return !i.klar; }).length;
    var done = items.length - left;

    emptyEl.hidden = items.length > 0;
    listEl.hidden = items.length === 0;
    clearBtn.hidden = done === 0;

    if (items.length === 0) {
      counterEl.textContent = "";
    } else if (left === 0) {
      counterEl.textContent = "Allt är avbockat – bra jobbat! 🎉";
    } else {
      counterEl.textContent = left + (left === 1 ? " vara" : " varor") + " kvar att handla";
    }
  }

  function renderItem(item) {
    var li = document.createElement("li");
    li.className = "item" + (item.klar ? " done" : "");

    var label = document.createElement("label");

    var check = document.createElement("input");
    check.type = "checkbox";
    check.className = "check";
    check.checked = item.klar;
    check.addEventListener("change", function () {
      item.klar = check.checked;
      save();
      render();
    });

    var name = document.createElement("span");
    name.className = "name";
    name.textContent = item.namn;

    label.appendChild(check);
    label.appendChild(name);

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Ta bort " + item.namn);
    remove.title = "Ta bort";
    remove.addEventListener("click", function () {
      items = items.filter(function (i) { return i.id !== item.id; });
      save();
      render();
    });

    li.appendChild(label);
    li.appendChild(remove);
    return li;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var namn = input.value.trim();
    if (!namn) {
      input.value = "";
      input.focus();
      return;
    }
    items.push({ id: newId(), namn: namn, klar: false });
    save();
    render();
    input.value = "";
    input.focus();
  });

  clearBtn.addEventListener("click", function () {
    items = items.filter(function (i) { return !i.klar; });
    save();
    render();
  });

  render();
})();
