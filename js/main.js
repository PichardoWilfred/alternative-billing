// add a redo funcitonality
// ádd the null systems logo on the nav.
const default_products = [ //default values
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
const products = JSON.parse(localStorage.getItem('products')) || default_products;

new MiniBar(document.querySelector('#scroll-container'));

// localStorage.setItem("products", JSON.stringify(products));
// users = JSON.parse(localStorage.getItem("products") || "[]");

document.addEventListener('alpine:init', () => {
    Alpine.data('store', () => ({
        init() {
            // 
            this.products.map((product_, index) => {
                if (index === 0) {
                    this.selectedProduct.id = product_.id
                }
                if (this.selectedProduct.id === product_.id) {
                    this.selectedProduct.label = product_.label
                }
            });
        },
        modal: false,
        deleteProduct(id){
            this.products.forEach((product_, index) => {
                if (id === product_.id) {
                    this.products.splice(index, 1);
                    if (!this.products.length) return; 
                    // find if there is a product after / before
                    const { id, label } = this.products[index] || this.products[index - 1] 
                    this.selectProduct({id, label})
                }
            });
            this.modal = false;
            this.updateLocalStorage('products', this.products, {serialize: true});
        },
        addProduct(){
            let id
            if (!this.products.length) {
                id = 1;
                this.selectProduct({id, label: '#' +  id})
            }else {
                if (this.products[this.products.length + 1]) {
                    id = this.products[this.products.length + 1].id + 1
                }else {
                    id = this.products[this.products.length - 1].id + 1
                }
            }
            this.products.push({
                id,
                quantity: 0,
                label: '#' +  id,
                editing: false,
            });
            this.updateLocalStorage('products', this.products, {serialize: true});
        },
        modalSelected: 'papo',
        // everytime that we select a different product its editing value will be set to false, (watcher)
        contextMenu: 0,
        selectedProduct: {id: 0, label: '', quantity: 0},
        products: [...products],
        unSelect(id){
            this.products.map((product) => { if(product.id === id) product.editing = false; })
        },
        selectProduct({ id, label }) {
            if (this.selectedProduct.id !== id) this.unSelect(id);
            // clean the rest
            this.products.map((product) => {
                if (this.selectedProduct.id !== id) product.editing = false
            })
            this.selectedProduct.id = id;
            this.selectedProduct.label = label;
        },
        showDelete(id){ //change the contextMenu only if its different or if we set it to 0.
            this.modal = true;
        },
        updateLabel({ id, label}, label_){
            const new_label = label_.replace(/\s+/g, ' ').trim();
            this.selectedProduct.label = new_label || label;
            // rewriting thew products array
            this.products.map((product) => { if(product.id === id) product.label = new_label; })
            this.updateLocalStorage('products', this.products, {serialize: true});
        },
        enableEdit({ id }){
            this.products.map((product) => {
                if (id == product.id) product.editing = true;
            });
        },
        clickOutside({ id, label }, label_) {
            // handle if its outside the .store
            if (id !== this.selectedProduct.id) return;
            if (id !== this.selectedProduct.id) return;
            let editing;
            this.products.map((product) => { if(product.id === id) editing = product.editing })

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
            // console.log(`${action}ing: ${new_quantity} to: ${this.selectedProduct.id} - ${this.selectedProduct.label}`);

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
            this.products.map((product) => {
                if (product.id === this.selectedProduct.id) {
                    product.quantity = product.quantity + (new_quantity * multiple)
                }
            });
            this.updateLocalStorage('products', this.products, {serialize: true});
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