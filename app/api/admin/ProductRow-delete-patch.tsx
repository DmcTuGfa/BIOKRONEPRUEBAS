// Reemplaza el bloque del modo "no editing" en ProductRow (la parte con el botón Editar)
// Busca en app/admin/productos/page.tsx el bloque:
//   ) : (
//     <div className="flex items-center gap-4 flex-wrap">
// Y reemplázalo con esto:

        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
              <Image
                src={product.image || "/placeholder.jpg"}
                alt={product.name}
                fill className="object-cover" sizes="48px"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg" }}
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-sm">{product.name}</p>
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                {product.stock === 0 && <Badge variant="destructive" className="text-xs">Agotado</Badge>}
                {!product.active && <Badge variant="outline" className="text-xs text-muted-foreground">Inactivo</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{product.presentation}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-bold text-foreground text-sm">{fmtMXN(product.priceMxn)}</p>
                <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
              </div>
              <Button size="sm" variant="outline" className="h-8" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1" />Editar
              </Button>
              <Button
                size="sm" variant="outline"
                className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                onClick={async () => {
                  if (!confirm(`¿Eliminar "${product.name}"? Si tiene pedidos, solo se desactivará.`)) return
                  const res = await fetch(`/api/admin/products/${product.id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ permanent: true }),
                  })
                  if (res.ok) onUpdated()
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
