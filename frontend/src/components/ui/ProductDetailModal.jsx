import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBox, FiMaximize2 } from 'react-icons/fi';
import { Badge } from './Badge';
import { useTranslation } from 'react-i18next';

export default function ProductDetailModal({ product, open, onClose }) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!open || !product) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed -top-10 inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[640px] rounded-[16px] border border-border bg-card shadow-[0_16px_40px_rgba(0,0,0,0.15)] max-h-[90vh] overflow-auto"
            >
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-[12px] bg-foreground text-background flex items-center justify-center">
                    <FiBox className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-[700] tracking-[-0.02em]">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {product.sku || 'NO-SKU'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-[8px] bg-muted hover:bg-accent flex items-center justify-center"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {product.images?.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(img.url)}
                        className="relative group h-24 w-full rounded-[12px] overflow-hidden border border-border hover:border-[#2AABEE] transition-colors"
                      >
                        <img
                          src={img.url}
                          alt={`${product.name} - ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <FiMaximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 rounded-[12px] bg-muted border border-border flex items-center justify-center text-muted-foreground text-[12px]">
                    Расм йўқ
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-[12px] bg-muted/50 border border-border p-3">
                    <div className="text-[11px] uppercase font-[650] text-muted-foreground">
                      Миқдори
                    </div>
                    <div className="text-[16px] font-[700] tabular-nums">
                      {product.currentQuantity}/{product.quantity}
                    </div>
                  </div>
                  <div className="rounded-[12px] bg-muted/50 border border-border p-3">
                    <div className="text-[11px] uppercase font-[650] text-muted-foreground">
                      Таннарх
                    </div>
                    <div className="text-[16px] font-[700] tabular-nums">
                      ${product.unitCost?.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-[12px] bg-muted/50 border border-border p-3">
                    <div className="text-[11px] uppercase font-[650] text-muted-foreground">
                      Сотув нархи
                    </div>
                    <div className="text-[16px] font-[700] tabular-nums">
                      ${product.minSellingPrice?.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-[12px] bg-muted/50 border border-border p-3">
                    <div className="text-[11px] uppercase font-[650] text-muted-foreground">
                      Ҳолати
                    </div>
                    <div className="mt-1">
                      <Badge
                        variant={
                          product.status === 'in_stock'
                            ? 'success'
                            : product.status === 'low_stock'
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-[12px] border border-border p-3">
                    <div className="text-[11px] text-muted-foreground">Халқаро йўл</div>
                    <div className="font-[700] tabular-nums">
                      ${product.totalIntlShipping?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="rounded-[12px] border border-border p-3">
                    <div className="text-[11px] text-muted-foreground">Ички йўл</div>
                    <div className="font-[700] tabular-nums">
                      ${product.totalLocalShipping?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="rounded-[12px] border border-border bg-foreground text-background p-3">
                    <div className="text-[11px] opacity-70">Жами фойда (агар сотилса)</div>
                    <div className="font-[800] tabular-nums text-[16px]">
                      $
                      {(
                        (product.minSellingPrice - product.unitCost) *
                        product.currentQuantity
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                {product.description && (
                  <div className="rounded-[12px] bg-muted/30 border border-border p-3 text-[13px] leading-[1.5]">
                    {product.description}
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2 border-t border-border">
                  <button
                    onClick={onClose}
                    className="h-9 px-4 rounded-[10px] border border-border bg-background text-[13px] font-[600]"
                  >
                    Ёпиш
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImagePreviewModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}

function ImagePreviewModal({ isOpen, imageUrl, onClose }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed -top-10 inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-[6px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-[90vw] max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
            <img
              src={imageUrl}
              alt="Rasm"
              className="max-w-full max-h-[85vh] rounded-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] object-contain"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}