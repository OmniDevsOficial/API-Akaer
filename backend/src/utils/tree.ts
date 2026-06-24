export type CategoriaFlat = {
  id: number
  parent_id: number | null
  nome: string
  nivel: number
  ordem: number
}

export type CategoriaNode = CategoriaFlat & {
  children: CategoriaNode[]
}

/** Transforma lista plana em árvore aninhada — qualquer profundidade */
export function buildTree(flat: CategoriaFlat[]): CategoriaNode[] {
  const map = new Map<number, CategoriaNode>()

  for (const item of flat) {
    map.set(item.id, { ...item, children: [] })
  }

  const roots: CategoriaNode[] = []

  for (const item of flat) {
    const node = map.get(item.id)!
    if (item.parent_id === null) {
      roots.push(node)
    } else {
      map.get(item.parent_id)?.children.push(node)
    }
  }

  return roots
}

/** Retorna IDs de um nó + todos os descendentes — usado para filtrar normas */
export function getDescendantIds(
  rootId: number,
  flat: Pick<CategoriaFlat, 'id' | 'parent_id'>[]
): number[] {
  const childMap = new Map<number, number[]>()
  for (const c of flat) {
    if (c.parent_id !== null) {
      const list = childMap.get(c.parent_id) ?? []
      list.push(c.id)
      childMap.set(c.parent_id, list)
    }
  }

  const ids: number[] = [rootId]
  const queue = [rootId]

  while (queue.length > 0) {
    const current = queue.shift()!
    const children = childMap.get(current) ?? []
    ids.push(...children)
    queue.push(...children)
  }

  return ids
}
