import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authSliceReducer from './AuthSlice'
import userSliceReducer from './UserSlice'
import roleSliceReducer from './RoleSlice'
import customerSliceReducer from './CustomerSlice'
import categorySliceReducer from './CategorySlice'
import permissionSliceReducer from './PermissionSlice'

import brandSliceReducer from './BrandSlice'
import topicSliceReducer from './TopicSlice'
import postSliceReducer from './PostSlice'
import navigationSliceReducer from './NavigationSlice'
import pageSliceReducer from './PageSlice'
import mediaSliceReducer from './MediaSlice'
import contactSliceReducer from './ContactSlice'
import productSliceReducer from './ProductSlice'
import optionSliceReducer from './OptionSlice'
import groupSliceReducer from './GroupSlice'
import commentSliceReducer from '@/views/admin/comment/CommentSlice'
import discountSliceReducer from './DiscountSlice'
import invoiceSliceReducer from './InvoiceSlice'
import reviewSliceReducer from './ReviewSlice'
import specificationGroupSliceReducer from './SpecificationGroupSlice'
import specificationSliceReducer from './SpecificationSlice'
import productAttributeSliceReducer from './ProductAttributeSlice'
import productVariantSliceReducer from './ProductVariantSlice'
import customerGroupSliceReducer from './CustomerGroupSlice'
import customerProductDiscountSliceReducer from './customerProductDiscountSlice'
import customerProductDiscountHisotySliceReducer from './customerProductDiscountHistorySlice'
import purchaseOrderSliceReducer from './PurchaseOrderSlice'

const persistConfig = { key: 'katec-vn', storage }

const persistedUserReducer = persistReducer(persistConfig, authSliceReducer)

export const store = configureStore({
  reducer: {
    auth: persistedUserReducer,
    category: categorySliceReducer,
    brand: brandSliceReducer,
    topic: topicSliceReducer,
    post: postSliceReducer,
    navigation: navigationSliceReducer,
    page: pageSliceReducer,
    media: mediaSliceReducer,
    contact: contactSliceReducer,
    option: optionSliceReducer,
    group: groupSliceReducer,
    comment: commentSliceReducer,
    discount: discountSliceReducer,
    invoice: invoiceSliceReducer,
    review: reviewSliceReducer,
    user: userSliceReducer,
    product: productSliceReducer,
    role: roleSliceReducer,
    customer: customerSliceReducer,
    permission: permissionSliceReducer,
    specificationGroup: specificationGroupSliceReducer,
    specification: specificationSliceReducer,
    productAttribute: productAttributeSliceReducer,
    productVariant: productVariantSliceReducer,
    customerGroup: customerGroupSliceReducer,
    customerProductDiscount: customerProductDiscountSliceReducer,
    customerProductDiscountHistory: customerProductDiscountHisotySliceReducer,
    purchaseOrderSlice: purchaseOrderSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)
