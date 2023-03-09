// add a redo funcitonality
// ádd the null systems logo on the nav.
const default_tables = [ //default values
    {   id: 1,
        quantity: 0,
        label: '#1',
        editing: false,
    },
    {   id: 2,
        quantity: 0,
        label: '#2',
        editing: false,
    },
]
const tables = JSON.parse(localStorage.getItem('tables')) || default_tables;

new MiniBar(document.querySelector('#scroll-container'));


document.addEventListener('alpine:init', () => {
    Alpine.data('store', () => ({
        timeout: {
            // productWidth: 0,
        },
        init() {
            // 
            this.tables.map((table_, index) => {
                if (index === 0) {
                    this.selectedTable.id = table_.id
                }
                if (this.selectedTable.id === table_.id) {
                    this.selectedTable.label = table_.label
                }
            });
        },
        modal: false,
        deleteTable(id){
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
        modalSelected: 'papo',
        // everytime that we select a different table its editing value will be set to false, (watcher)
        contextMenu: 0,
        selectedTable: {id: 0, label: '', quantity: 0},
        tables: [...tables],
        unSelect(id){
            this.tables.map((table) => { if(table.id === id) table.editing = false; })
        },
        selectTable({ id, label }) {
            if (this.selectedTable.id !== id) this.unSelect(id);
            // clean the rest
            this.tables.map((table) => {
                if (this.selectedTable.id !== id) table.editing = false
            })
            this.selectedTable.id = id;
            this.selectedTable.label = label;
        },
        showDelete(id){ //change the contextMenu only if its different or if we set it to 0.
            this.modal = true;
        },
        updateLabel({ id, label}, label_){
            const new_label = label_.replace(/\s+/g, ' ').trim();
            this.selectedTable.label = new_label || label;
            // rewriting thew tables array
            this.tables.map((table) => { if(table.id === id) table.label = new_label; })
            this.updateLocalStorage('tables', this.tables, {serialize: true});
        },
        enableEdit({ id }){
            this.tables.map((table) => {
                if (id == table.id) table.editing = true;
            });
        },
        clickOutside({ id, label }, label_) {
            // handle if its outside the .store
            if (id !== this.selectedTable.id) return;
            if (id !== this.selectedTable.id) return;
            let editing;
            this.tables.map((table) => { if(table.id === id) editing = table.editing })

            this.unSelect(id);
            if (editing) { 
                this.updateLabel({id, label}, label_)
                window.getSelection().removeAllRanges();
            }
        },
        enterPressed({ id, label }, label_){
            this.unSelect(id)
            this.updateLabel({id, label},label_)
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
                // console.log('serializing');
                localStorage.setItem(key, JSON.stringify(value))                
            }else {
                // console.log('not serializing');
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