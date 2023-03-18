// add a redo funcitonality
// ádd the null systems logo on the nav.
const default_tables = [ //default values
    {   id: 1, 
        label: 'Default #1',
        quantities: [20, 30, 50],
        editing: {
            label: false,
            quantity: false
        },
    },
    {   id: 2,
        label: 'Default #2',
        quantities: [10, 280, 20],
        editing: {
            label: false,
            quantity: false
        },
    },
]
const selectedTable = JSON.parse(localStorage.getItem('selectedTable')) || { id: 0, editing: {label: false, quantity: false, new_quantity: false}};

const tables = JSON.parse(localStorage.getItem('tables')) || default_tables;
// new MiniBar(document.querySelector('#scroll-container'));

document.addEventListener('alpine:init', () => {
    Alpine.data('store', () => ({
        timeout: {
            quantity: 0,
            focus_quantity: 0,
            focus_new_quantity: 0,
            focus_label: 0,
        },
        modal: false,
        tables: [...tables],
        new_quantity: 0,
        selectedTable: selectedTable,
        init() {
            if (selectedTable.id !== 0) return; //if there's not selectedTable on localstorage assign the first one 
            this.tables.map((table_, index) => {
                if (index === 0) {
                    this.selectedTable.id = table_.id;
                }
                if (this.selectedTable.id === table_.id) {
                    this.selectedTable.label = table_.label;
                    this.selectedTable.quantities = table_.quantities;
                    
                    this.selectedTable['editing'].label = false;
                    this.selectedTable['editing'].quantity = false;
                    this.selectedTable['editing'].new_quantity = false;

                    this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true });
                } 
            });
        },
        get quantity_sum() {
            return this.selectedTable.quantities.reduce((a, b) => a + b);
        },
        focus_label() {
            this.timeout.focus_label = setTimeout(() => {
                this.tables.map((table) => {
                    if (table.id === this.selectedTable.id) {
                        table.editing.label = true;
                    };
                });
            });
        },
        focus_quantity(index) {
            this.timeout.focus_quantity = setTimeout(() => { // we need to make this function to enter after our .outside handler (saveQuantity)
                if (this.selectedTable.editing.quantity === index) return; // ignore if we select the same one
                this.selectedTable.editing.quantity = index;
                const input = document.querySelector(`#input-quantity-${index}`);
                this.timeout.quantity = setTimeout(() => {
                    input.focus();
                }, 0);
            }, 0);
        },
        focus_newQuantity() {
            this.timeout.focus_new_quantity = setTimeout(() => {
                this.tables.map((table) => {
                    if (table.id === this.selectedTable.id) {
                        table.editing.new_quantity = true;
                    };
                });
            }, 0);
        },
        saveLabel(element) { // rewriting the tables array (make this triggewr only when its focused)
            element.blur();
            const label_ = element.value;
            const new_label = label_.replace(/\s+/g, ' ').trim();
            if (new_label) {
                this.selectedTable.label = new_label || label;
                this.updateTable({ type: 'label', new_label: this.selectedTable.label}); //save label
            }
        },
        saveNewQuantity(element) {
            const quantity = element.value;
            const new_label = quantity.replace(/\s+/g, ' ').trim();
            if (new_label) {
                this.updateTable({ type: 'new_quantity', new_quantity: this.new_quantity, el: element}); //save label
            }
            
        },
        saveQuantity(action, index, element) {
            if (this.selectedTable.editing.quantity !== index) return; //validating that only the selected will be triggered
            const index_editing = this.selectedTable.editing.quantity;
            this.selectedTable.editing.quantity = false;
            let new_quantity;
            // we need this in case the user clicks on a different tab.
            if (action === 'unfocused') {
                const input = element.querySelector('input');
                new_quantity = input.value;
            }
            if (action === 'enter') new_quantity = element.value;
            this.updateTable({new_quantity, index: index_editing, type: 'quantity'});
        },
        // new_quantity = 0, index = 0, action
        updateTable(action) {
            let last_edited;
            this.tables.map((table) => {
                if (table.editing.label) {
                    last_edited = table;
                    table.editing.label = false;
                }

                if (table.id === this.selectedTable.id) {  // updating the specific quantity
                    if (action.type === 'quantity') {
                        if ( action.new_quantity * 1 <= 0) {
                            table.quantities.splice(action.index, 1);
                        }else {
                            table.quantities[action.index] = action.new_quantity.replace(/\D/g,'') * 1;
                        }
                        this.selectedTable.quantities = table.quantities;
                    }
                    if (action.type === 'label' && last_edited) {
                        table.label = action.new_label;
                    }
<<<<<<< HEAD

                    console.log(`${action.type} is`);
                    console.log(last_edited);
                    if (action.type === 'new_quantity' && last_edited) {
                        console.log(last_edited);
                        // console.log('need to update');
=======
                    if (action.type === 'new_quantity') {
                        table.quantities.push(action.new_quantity.replace(/\D/g,'') * 1);
                        this.selectedTable.quantities = table.quantities;
                        this.new_quantity = 0;
                        action.el.focus();
>>>>>>> 2f6f672cae0513175dd1d725f2cc8a83cafce2ad
                    }
                }
            });
            
            this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true })
            this.updateLocalStorage('tables', this.tables, { serialize: true });
        },
        deleteTable(id) {
            this.tables.forEach((table_, index) => {
                if (id === table_.id) {
                    this.tables.splice(index, 1);
                    if (!this.tables.length) return;
                    // find if there is a table after / before.
                    const { id, label } = this.tables[index] || this.tables[index - 1] 
                    this.selectTable({id, label})
                }
            });
            this.modal = false;
            this.updateLocalStorage('tables', this.tables, { serialize: true });
        },
        addTable() {
            let id;
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
                quantities: [],
                label: '#' +  id,
                editing: {
                    label: false,
                    quantity: false,
                    new_quantity: false,
                },
            });
            this.updateLocalStorage('tables', this.tables, { serialize: true });
        },
        // everytime that we select a different table its editing value will be set to false, (watcher)
        unSelectTable(id) {
            this.tables.map((table) => {
                if (table.id === id) {
                    table.editing.label = false;
                    table.editing.quantity = false;
                } 
            });
        },
        selectTable({ id, label, quantities }) {
            if (this.selectedTable.id !== id) this.unSelectTable(id);
            this.tables.map((table) => {
                if (this.selectedTable.id !== id) table.editing.quantity = false; // clean the rest
            })
            this.selectedTable.id = id; 
            this.selectedTable.label = label;
            this.selectedTable.quantities = quantities;
            
            this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true });
        },
        updateLocalStorage(key, value, options = { serialize: false }){
            if (options.serialize) {
                localStorage.setItem(key, JSON.stringify(value))                
            }else {
                localStorage.setItem(key, value)                
            }
        },
        // clickOutside(index, label_) {
        // if (id !== this.selectedTable.id) return;
        // let editing;
        // this.tables.map((table) => { if(table.id === id) editing = table.editing })

        // this.unSelectTable(id);
        // this.updateLabel({id, label}, label_)
        // },
        // enterPressed({ id, label }, label_){
        //     this.unSelectTable(id)
        //     this.updateLabel({id, label}, label_)
        // },
        // inputQuantity: 0,
        // invalidQuantity: false,
        // editQuantity(action) {
        //     if (this.inputQuantity === undefined || this.inputQuantity === null || this.inputQuantity === 0) {
        //         this.inputQuantity = 0;
        //         this.invalidQuantity = true;
        //         return;
        //     }
        //     if (this.inputQuantity < 0) {
        //         this.invalidQuantity = true;
        //         return;
        //     }
        //     this.invalidQuantity = false;
        //     const new_quantity = Math.ceil(this.inputQuantity);
        //     // console.log(`${action}ing: ${new_quantity} to: ${this.selectedTable.id} - ${this.selectedTable.label}`);

        //     let multiple = 0;
        //     switch (action) {
        //         case 'add':
        //             multiple = 1;
        //             break;
        //         case 'substract':
        //             multiple = -1;
        //             break;
        //         default:
        //             console.error('operation unrecognized');
        //             break;
        //     }
        //     // console.log(multiple);
        //     this.tables.map((table) => {
        //         if (table.id === this.selectedTable.id) {
        //             table.quantity = table.quantity + (new_quantity * multiple)
        //         }
        //     });
        //     this.updateLocalStorage('tables', this.tables, {serialize: true});
        //     this.inputQuantity = 0;
        //     // get the input data
        //     // clean the input
        // },
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