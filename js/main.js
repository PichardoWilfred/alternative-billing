// add a redo funcitonality
// ádd the null systems logo on the nav.
const default_tables = [ //default values
    {   id: 1, 
        label: 'Lista #1',
        quantities: [
            { name: '',  value: 0 }
        ],
        editing: {
            label: false,
            quantity: {index: null, input: null}
        },
    },
    {   id: 2,
        label: 'Lista #2',
        quantities: [
            { name: '',  value: 0 }
        ],
        editing: {
            label: false,
            quantity: {index: null, input: null}
        },
    },
]
const selectedTable = JSON.parse(localStorage.getItem('selectedTable')) || { id: 0, editing: { label: false, quantity: { index: null, input: null } } };
const tables = JSON.parse(localStorage.getItem('tables')) || default_tables;

document.addEventListener('alpine:init', () => {
    Alpine.data('store', () => ({
        timeout: {
            quantity: 0,
            focus_quantity: 0,
            focus_new_quantity: 0,
            focus_label: 0,
        },
        modal: {
            visible: false,
            title: '',
            message: {
                text: '',
                variables: ['']
            },
            message_text() {
                this.message.variables.forEach( (variable, index) => {
                    this.message.text = this.message.text.replace(`{${index}}`, variable);
                });
                return this.message.text;
            },
            action: '',
            content: {
                value: false,
                name: ''
            }
        },
        popup: {
            visible: false
        },
        open_modal(title = '', text = '', variables = [''], action_name = '', content_modal = { value: false, name: false }){
            this.modal.visible = true;
            this.modal.title = title;
            this.modal.message = { text, variables };
            this.modal.action = action_name;
            // value & name if the modal that we want is not generic.
            this.modal.content.value = content_modal.value;
            this.modal.content.name = content_modal.name;
        },
        modal_action(action) {
            switch (action) {
                case 'delete':
                    this.deleteTable();
                break;
                case 'reset':
                    this.resetApp();
                break;
                default:
                    break;
            }
        },
        close_modal() {
            this.modal.visible = false;
            this.modal.title = '';
            this.modal.message = {
                text: '',
                variables: ['']
            }
            this.modal.action = '';
            this.modal.content = {
                value: false,
                name: ''
            };
        },
        tables,
        new_quantity: 0,
        selectedTable,
        init() {
            if (selectedTable.id !== 0) return; //if there's not selectedTable on localstorage assign the first one 
            this.tables.map((table_, index) => {
                if (index === 0) this.selectedTable.id = table_.id;
                if (this.selectedTable.id === table_.id) {
                    this.selectedTable.label = table_.label;
                    this.selectedTable.quantities = table_.quantities;
                    
                    this.selectedTable['editing'].label = false;
                    this.selectedTable['editing'].quantity = { index: null, input: null };
                    this.selectedTable['editing'].new_quantity = false;

                    this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true });
                }
            });
        },
        get total() {
            const format = (value) => {
                return (value).toLocaleString('en-US', {
                    style: 'currency', 
                    currency: 'USD'
                });;
            }
            if (this.selectedTable.quantities.length < 1) {
                return format(0)
            }
            let sum = 0;
            this.selectedTable.quantities.forEach((quantity) => {
                sum += quantity.value * 1;
            });
            return format(sum);
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
        focus_quantity(index, input) {
            this.timeout.focus_quantity = setTimeout(() => { // we need to make this function to enter after our .outside handler (saveQuantity)
                if (this.selectedTable.editing.quantity.index === index) return; // ignore if we select the same one
                this.selectedTable.editing.quantity = {index, input};
                const input_ = document.querySelector(`#quantity-${input}-${index}`);
                this.timeout.quantity = setTimeout(() => {
                    input_.focus();
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
            const new_label = quantity.replace(/,+/g,'').replace(/\s+/g, ' ').trim();
            if (new_label && new_label > 0) {
                this.updateTable({ type: 'new_quantity', new_quantity: this.new_quantity, el: element}); //save label
            }
        },
        saveQuantity(action, index, element) { // (we need to specify which one of the inputs we are focusing...)            
            if (this.selectedTable.editing.quantity.index !== index) return; //validating that only the selected will be triggered
            const index_editing = this.selectedTable.editing.quantity.index;
            this.selectedTable.editing.quantity = { index: null, input: null };
            let updated_quantity;

            // we need this in case the user clicks on a different tab.
            if (action === 'unfocused') {
                const value = element.querySelector('input.value');
                const name = element.querySelector('input.name');
                updated_quantity = { value: value.value, name: name.value };
            }
            if (action === 'enter') {
                const li = element.parentElement;
                const value = li.querySelector('input.value');
                const name = li.querySelector('input.name');
                updated_quantity = { value: value.value, name: name.value };
            };

            this.updateTable({type: 'quantity', updated_quantity, index: index_editing});
        },
        // new_quantity = 0, index = 0, action
        updateTable(action) {
            let last_edited;
            this.tables.map((table) => {
                if (table.editing.label) {
                    last_edited = table;
                    table.editing.label = false;
                }
                if (table.id !== this.selectedTable.id) return;  // updating the specific quantity
                if (action.type === 'quantity') {
                    const {name, value} = action.updated_quantity;
                    // console.log(value.replace(/\D/g,'') * 1);
                    // if ( action.new_quantity * 1 <= 0) { }else { }
                    // table.quantities.splice(action.index, 1); // (delete)
                    table.quantities[action.index] = { name, value: value.replace(/\D/g,'') * 1 };
                    this.selectedTable.quantities = table.quantities;
                }
                if (action.type === 'label' && last_edited) {
                    table.label = action.new_label;
                }
                if (action.type === 'new_quantity') {
                    const name = `Item #${table.quantities.length + 1}`;
                    table.quantities.push({ name, value: action.new_quantity.replace(/\D/g,'') * 1 });
                    this.selectedTable.quantities = table.quantities;
                    this.new_quantity = 0;
                    action.el.focus();
                }
                // }
            });
            this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true })
            this.updateLocalStorage('tables', this.tables, { serialize: true });
        },
        deleteTable() {
            const id = this.selectedTable.id;
            this.tables.forEach((table_, index) => {
                if (id === table_.id) {
                    let id_;
                    let label_;
                    let quantities_;
                    this.tables.splice(index, 1);
                    if (this.tables.length) {
                        const { id, label, quantities } = this.tables[index] || this.tables[index - 1];
                        id_ = id;
                        label_ = label;
                        quantities_ = quantities;
                    }
                    this.selectTable({ // find if there is a table after / before.
                        id: id_, 
                        label: label_, 
                        quantities: quantities_ || [{ name: '', value: 0}]
                    });
                }
            });
            this.close_modal();
            this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true });
            this.updateLocalStorage('tables', this.tables, { serialize: true });
        },
        addTable() {
            let id;
            const new_table = {
                quantities: [{ name: 'Item #1', value: 0 }],
                editing: {
                    label: false,
                    quantity: {index: null, input: null},
                    new_quantity: false,
                },
            }
            if (!this.tables.length) {
                id = 1;
                this.tables.push({ id, label: `Lista #${id}`, ...new_table });
                this.selectTable({ id, label: `Lista #${id}`, ...new_table });
            }else {
                if (this.tables[this.tables.length + 1]) {
                    id = this.tables[this.tables.length + 1].id + 1
                }else {
                    id = this.tables[this.tables.length - 1].id + 1
                }
                this.tables.push({ id, label: `Lista #${id}`, ...new_table });
            }
            this.updateLocalStorage('tables', this.tables, { serialize: true });
        },
        // everytime that we select a different table its editing value will be set to false, (watcher)
        unSelectTable(id) {
            this.tables.map((table) => {
                if (table.id === id) {
                    table.editing.label = false;
                    table.editing.quantity = {index: null, input: null};
                }
            });
        },
        selectTable({ id, label, quantities}) {
            if (this.selectedTable.id !== id) this.unSelectTable(id);
            this.tables.map((table) => {
                if (this.selectedTable.id !== id) {
                    table.editing.quantity = {index: null, input: null}; // clean the rest
                }
            })
            this.selectedTable.id = id; 
            this.selectedTable.label = label;
            this.selectedTable.quantities = quantities || [0];
            
            this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true });
        },
        resetApp() { // contingency plan
            localStorage.clear();
            this.tables = [
                {
                    id: 1, 
                    label: 'Lista #1',
                    quantities: [{ name: 'Item #1', value: 0}],
                    editing: {
                        label: false,
                        quantity: { index: null, input: null }
                    },
                }
            ];
            this.selectedTable = {
                id: 1,
                label: 'Lista #1',
                quantities: [{ name: 'Item #1', value: 0}],
                editing: {
                    label: false,
                    quantity: { index: null, input: null }
                },
            }
            this.updateLocalStorage('selectedTable', this.selectedTable, { serialize: true })
            this.updateLocalStorage('tables', this.tables, { serialize: true });
            this.close_modal();
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