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

document.addEventListener('alpine:init', () => {
    Alpine.data('store', () => ({
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
                quantity: 125,
                label: 'Roberto',
                editing: false,
            },
            {   id: 4,
                quantity: 125,
                label: 'Roberto',
                editing: false,
            },
            {   id: 5,
                quantity: 125,
                label: 'Roberto',
                editing: false,
            },
        ],
        unSelectAll(){
            this.products.map((product) => { product.editing = false; })
        },
        selectProduct({id}) {
            console.log(`selecting: \n${id}`);
            // this.editingProduct = 0;
            if (this.selectedProduct !== id) {
                this.unSelectAll();
            };
            this.selectedProduct = id;
        },
        showContextMenu(id){
            // const hide = id === 0;
            // if (!hide) {
            //     console.log('wii');
            // }else {
            // }
            this.contextMenu = id;
            console.log(`context: \n${this.contextMenu}`);
        },
        enableEdit({id}){
            this.products.map((product) => {
                if (id == product.id) {
                    product.editing = true;
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