import { Route, Routes } from "react-router-dom"
import ProductsManagment from "./ProductsManagment/ProductsManagment"
import AddProduct from "./ProductsManagment/AddProduct"
import EditProduct from "./ProductsManagment/EditProduct"
import ProductPreview from "./ProductsManagment/ProductPreview"
import CategoriesManagment from "./CategoriesManagment/CategoriesManagment"
import AddCategory from "./CategoriesManagment/AddCategory"
import EditCategory from "./CategoriesManagment/EditCategory"

function Management() {
  return (
    <Routes>
      <Route path="/" element={<ProductsManagment />} />
      
      <Route path="/products" element={<ProductsManagment />} />
      <Route path="/products/new" element={<AddProduct />} />
      <Route path="/products/:id" element={<ProductPreview />} />
      <Route path="/products/edit/:id" element={<EditProduct />} />
      
      <Route path="/categories" element={<CategoriesManagment />} />
      <Route path="/categories/new" element={<AddCategory />} />
      <Route path="/categories/edit/:id" element={<EditCategory />} />
    </Routes>
  )
}

export default Management 