const products = [
    {   id: 1,
        quantity: 12,
        label: 'papo',
        editing: false,
    },
    {   id: 2,
        quantity: 112,
        label: 'Roberto',
        editing: false,
    },
]
new MiniBar(document.querySelector('#scroll-container'));

// localStorage.setItem("users", JSON.stringify(users));
// users = JSON.parse(localStorage.getItem("users") || "[]");

document.addEventListener('alpine:init', () => {
    Alpine.data('store', () => ({
        // everytime that we select a different product its editing value will be set to false, (watcher)
        contextMenu: 0,
        selectedProduct: 1,
        // selectedProductLabel: this.getLabel(),
        products: [...products],
        unSelect(id){
            this.products.map((product) => { if(product.id === id) product.editing = false; })
            window.getSelection().removeAllRanges();
        },
        selectProduct({ id, label }) {
            if (this.selectedProduct !== id) this.unSelect(id);
            // clean the rest
            this.products.map((product) => {
                if (this.selectedProduct !== id) product.editing = false
            })
            this.selectedProduct = id;
            // this.selectedProductLabel = label;
        },
        showDelete(id){ //change the contextMenu only if its different or if we set it to 0.
            if (this.selectedProduct !== id) return;
            if (this.selectedProduct !== id) return; 
            console.log(`deleting id: \n${id}`);
        },
        enableEdit({ id }){
            this.products.map((product) => {
                if (id == product.id) product.editing = true;
            });
        },
        updateLabel({ id }){
            this.unSelect(id)
        },
        clickOutside({ id }){
            if (id !== this.selectedProduct) return;
            this.unSelect(id);
        }
    }))
})