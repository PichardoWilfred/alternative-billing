// add a redo funcitonality
// ádd the null systems logo on the nav.
const default_tables = [ //default values
    {   id: 1, 
        label: 'Default #1',
        quantities: [20, 30, 50],
        editing: null,
    },
    {   id: 2,
        label: 'Default #2',
        quantities: [10, 280, 20],
        editing: null,
    },
]
const selectedTable = JSON.parse(localStorage.getItem('selectedTable')) || { id: 0};

const tables = JSON.parse(localStorage.getItem('tables')) || default_tables;
// new MiniBar(document.querySelector('#scroll-container'));

document.addEventListener('alpine:init', () => {
    Alpine.data('store', () => ({
        timeout: {
            quantity: 0,
            focus: 0
        },
        init() {
            if (selectedTable.id !== 0) return; //if there's not selectedTable on localstorage assign the first one 
            this.tables.map((table_, index) => {
                if (index === 0) {
                    this.selectedTable.id = table_.id
                }
                if (this.selectedTable.id === table_.id) {
                    this.selectedTable.label = table_.label;
                    this.selectedTable.quantities = table_.quantities;
                    this.selectedTable.editing = null;
                    this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true });
                }
            });
        },
        updateLabel(action = 'enter',input){ // rewriting the tables array
            // console.log(action);
            if (action === 'unfocused' ) {
                console.log(input === document.activeElement);
            }
            if (action === 'enter') {
                console.log('uwu');
            }
            const label_ = input.value;
            const { id, label } = this.selectedTable;
            const new_label = label_.replace(/\s+/g, ' ').trim();
            this.selectedTable.label = new_label || label;
            
            // this.tables.map((table) => { if (table.id === id) table.label = new_label; })
            // this.updateLocalStorage('tables', this.tables, {serialize: true});
        },
        enableEdit({ id }){
            // this.tables.map((table) => {
            //     if (id == table.id) table.editing = true;
            // });
        },
        editingLabel: false,
        focus_quantity(index, label) {
            this.focus = setTimeout(() => { // we need to make this function to enter after our .outside handler (saveQuantity)
                if (this.selectedTable.editing === index) return; // ignore if we select the same one
                this.selectedTable.editing = index;
                const input = document.querySelector(`#input-quantity-${index}`);
                this.timeout.quantity = setTimeout(() => {
                    input.focus();
                }, 0);
            }, 0)
        },
        saveQuantity(action, index, element) {
            if (this.selectedTable.editing !== index) return; //validating that only the selected will be triggered
            const index_editing = this.selectedTable.editing;
            this.selectedTable.editing = null;
            let new_quantity;
            if (action === 'unfocused') {
                const input = element.querySelector('input')
                new_quantity = input.value;
            }
            if (action === 'enter') new_quantity = element.value;
            this.updateTable(new_quantity, index_editing);
        },
        updateTable(new_quantity, index) {
            this.tables.map((table) => { // updating the specific quantity
                if (table.id === this.selectedTable.id) {
                    table.quantities[index] = new_quantity * 1;
                }
            });
            this.tables.map((table_) => { // updating the selectedTable object
                if (table_.id === this.selectedTable.id) {
                    this.selectedTable.quantities = table_.quantities;
                }
            });
            this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true })
            this.updateLocalStorage('tables', this.tables, { serialize: true });
        },
        modal: false,
        deleteTable(id) {
            this.tables.forEach((table_, index) => {
                if (id === table_.id) {
                    this.tables.splice(index, 1);
                    if (!this.tables.length) return; 
                    // find if there is a table after / before
                    const { id, label } = this.tables[index] || this.tables[index - 1] 
                    this.selectTable({id, label})
                }
            });
            this.modal = false;
            this.updateLocalStorage('tables', this.tables, {serialize: true});
        },
        addTable(){
            let id
            if (!this.tables.length) {
                id = 1;
                this.selectTable({id, label: '#' +  id})
            }else {
                if (this.tables[this.tables.length + 1]) {
                    id = this.tables[this.tables.length + 1].id + 1
                }else {
                    id = this.tables[this.tables.length - 1].id + 1
                }
            }
            this.tables.push({
                id,
                quantity: 0,
                label: '#' +  id,
                editing: false,
            });
            this.updateLocalStorage('tables', this.tables, {serialize: true});
        },
        // everytime that we select a different table its editing value will be set to false, (watcher)
        contextMenu: 0,
        new_quantity: 0,
        selectedTable: selectedTable,
        tables: [...tables],
        unSelect(id){
            this.tables.map((table) => { if(table.id === id) table.editing = false; })
        },
        selectTable({ id, label, quantities }) {
            if (this.selectedTable.id !== id) this.unSelect(id);
            // clean the rest
            this.tables.map((table) => {
                if (this.selectedTable.id !== id) table.editing = false
            })
            this.selectedTable.id = id;
            this.selectedTable.label = label;
            this.selectedTable.quantities = quantities;
            
            this.updateLocalStorage('selectedTable', this.selectedTable, {serialize: true});
        },
        focus_newQuantity(index, label) {},
        clickOutside(index, label_) {
            // if (id !== this.selectedTable.id) return;
            // let editing;
            // this.tables.map((table) => { if(table.id === id) editing = table.editing })

            // this.unSelect(id);
            // this.updateLabel({id, label}, label_)
        },
        enterPressed({ id, label }, label_){
            this.unSelect(id)
            this.updateLabel({id, label}, label_)
        },
        inputQuantity: 0,
        invalidQuantity: false,
        editQuantity(action){
            // validate 0
            if (this.inputQuantity === undefined || this.inputQuantity === null || this.inputQuantity === 0) {
                this.inputQuantity = 0;
                this.invalidQuantity = true;
                return;
            }
            if (this.inputQuantity < 0) {
                this.invalidQuantity = true;
                return;
            }
            
            this.invalidQuantity = false;
            const new_quantity = Math.ceil(this.inputQuantity);
            // console.log(`${action}ing: ${new_quantity} to: ${this.selectedTable.id} - ${this.selectedTable.label}`);

            let multiple = 0;
            switch (action) {
                case 'add':
                    multiple = 1;
                    break;
                case 'substract':
                    multiple = -1;
                    break;
                default:
                    console.error('operation unrecognized');
                    break;
            }
            // console.log(multiple);
            this.tables.map((table) => {
                if (table.id === this.selectedTable.id) {
                    table.quantity = table.quantity + (new_quantity * multiple)
                }
            });
            this.updateLocalStorage('tables', this.tables, {serialize: true});
            this.inputQuantity = 0;
            // get the input data
            // clean the input
        },
        updateLocalStorage(key, value, options = {serialize: false}){
            if (options.serialize) {
                localStorage.setItem(key, JSON.stringify(value))                
            }else {
                localStorage.setItem(key, value)                
            }
        }
    }));
})

// utilities
// function focusDiv(id) {
//     const parent = document.querySelector('#product-'+id)
//     const span = parent.querySelector('span.tag');
//     const selection = window.getSelection();
//     const range = document.createRange();
//     range.setStart(span, 0);
//     range.setEnd(span, 0);
//     selection.removeAllRanges();
//     selection.addRange(range);
// }