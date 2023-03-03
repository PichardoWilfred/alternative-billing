function papo(){
    console.log("papo");
}

document.addEventListener('alpine:init', () => { //need this event listener to be activated amongst the Alpine apps aparently
    Alpine.store('darkMode', {
        on: false,

        toggle() {
            this.on = ! this.on
        }
    })
})
function focusDiv(id, product_id) {
    const product_element = document.querySelector(`#product-${product_id}`);
    let p = product_element.querySelector(id);
    console.log(p);
    let s = window.getSelection()
    let r = document.createRange()
    r.setStart(p, p.childElementCount)
    r.setEnd(p, p.childElementCount)
    s.removeAllRanges()
    s.addRange(r)
}

document.addEventListener('alpine:init', () => {
    Alpine.data('store', () => ({
        focus_timeout: 0,
        // everytime that we select a different product its editing value will be set to false, (watcher)
        contextMenu: 0,
        selectedProduct: 1,
        products: [
            {   id: 1,
                quantity: 12,
                label: 'papo',
                editing: false,
            },
            {   id: 2,
                quantity: 125,
                label: 'Roberto',
                editing: false,
            },
            {   id: 3,
                quantity: 300,
                label: 'Roberto',
                editing: false,
            },
            {   id: 4,
                quantity: 20,
                label: 'Roberto',
                editing: false,
            },
            {   id: 5,
                quantity: 07,
                label: 'Roberto',
                editing: false,
            },
        ],
        unSelectAll(){
            this.products.map((product) => { product.editing = false; })
        },
        selectProduct({id}) {
            if (this.selectedProduct !== id) {
                this.unSelectAll();
            };
            this.selectedProduct = id;
        },
        showContextMenu(id){
            //change the contextMenu only if its different or if we set it to 0.
            if (this.selectedProduct === id || id === 0 ) {
                this.contextMenu = id;
            }
        },
        enableEdit({id}){
            clearTimeout(this.focus_timeout);
            this.products.map((product) => {
                if (id == product.id) {
                    product.editing = true;
                    this.focus_timeout = setTimeout(() => {
                        focusDiv('.tag', product.id)
                    }, 0)
                }
            });
        },
        updateLabel({id, label}){
            this.products.map((product) => {
                if (product.id === id) {
                    product.editing == false;
                }
            })
            this.unSelectAll();
            // keep updated label
        }
    }))
})