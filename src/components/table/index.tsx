import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Cell,
  ColumnDef,
  Header,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CSSProperties, useMemo, useState } from 'react'

function LeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      className="w-6 h-6 stroke-zinc-500 hover:stroke-zinc-500/80"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5 8.25 12l7.5-7.5"
      />
    </svg>
  )
}

function RightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      className="w-6 h-6 stroke-zinc-500 hover:stroke-zinc-500/80"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
      />
    </svg>
  )
}

export type Column<T> = ColumnDef<T>

interface TableProps<T> {
  data: Array<T>
  columns: Array<Column<T>>
  columnOrder: string[]
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>

  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  pageSize: number
  setPageSize: React.Dispatch<React.SetStateAction<number>>
  prevPage: () => Promise<void>
  nextPage: () => Promise<void>
}

function DraggableTableHeader<T>({ header }: { header: Header<T, unknown> }) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <th
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={style}
      className="px-6 py-3"
    >
      <button {...attributes} {...listeners}>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </button>
    </th>
  )
}

function DragAlongCell<T>({ cell }: { cell: Cell<T, unknown> }) {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <td style={style} ref={setNodeRef} className="px-6 py-4">
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}

export default function Table<T>({
  data,
  columns,
  columnOrder,
  setColumnOrder,
  page,
  setPage,
  pageSize,
  setPageSize,
  nextPage,
  prevPage,
}: TableProps<T>) {
  const [curPage, setCurPage] = useState(1)
  const total = useMemo(() => data.length, [data])
  const fromItem = useMemo(() => page * pageSize, [page, pageSize])
  const toItem = useMemo(
    () => Math.min(total - 1, page * pageSize + pageSize - 1),
    [page, pageSize, total],
  )
  const lastPage = useMemo(() => Math.ceil(total / pageSize), [total, pageSize])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: total / pageSize + (total % pageSize === 0 ? 0 : 1),
    state: {
      columnOrder,
    },
    manualPagination: true,
    onColumnOrderChange: setColumnOrder,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex)
      })
    }
  }

  function handlePrevPage() {
    page > 0 && prevPage()
  }

  function handleNextPage() {
    page < lastPage - 1 && nextPage()
  }

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(parseInt(e.target.value))
    setPage(0)
    setCurPage(0)
  }

  function handleChangePage() {
    if (curPage > 0 && curPage <= lastPage) {
      setPage(curPage - 1)
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="w-full p-2">
        <div className="w-full h-4" />
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {headerGroup.headers.map((header) => (
                    <DraggableTableHeader key={header.id} header={header} />
                  ))}
                </SortableContext>
              </tr>
            ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows.slice(fromItem, toItem + 1)
              .map((row) => (
                <tr key={row.id} className="bg-white border-b">
                  {row.getVisibleCells().map((cell) => (
                    <SortableContext
                      key={cell.id}
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      <DragAlongCell key={cell.id} cell={cell} />
                    </SortableContext>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        <div className="py-2 px-4 border-b text-xs md:text-sm text-gray-700 flex flex-row justify-between items-center">
          <p className="">
            Mostrando {1 + fromItem} até {1 + toItem} de {total} items
          </p>

          <div className="flex flex-row items-center gap-4 text-gray-500">
            <div className="w-fit flex flex-row gap-0 items-center text-center rounded-md border-zinc-300 border-y-[1px] *:border-zinc-300 *:border-l-[1px] *:border-r-[1px] cursor-pointer">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => handlePrevPage()}
                className="w-10 h-8 flex items-center justify-center p-1 bg-white hover:bg-zinc-200 rounded-s-md"
              >
                <LeftIcon />
              </button>
              <div className="w-10 h-8 flex items-center justify-center border-none hover:bg-blue-500 hover:text-zinc-50">
                <p>{page + 1}</p>
              </div>
              <button
                type="button"
                disabled={page === lastPage - 1}
                onClick={() => handleNextPage()}
                className="w-10 h-8 flex items-center justify-center p-1 bg-white hover:bg-zinc-200 rounded-e-md"
              >
                <RightIcon />
              </button>
            </div>

            <div className="flex flex-row items-center gap-2">
              <input
                type="number"
                value={curPage}
                min={1}
                className="w-16 h-8 p-1 border-zinc-300 border-[1px] rounded-md text-center ring-0 outline-none focus:border-[2px] focus:border-blue-500"
                onChange={(e) => setCurPage(Number(e.target.value))}
              />
              <button
                type="button"
                onClick={handleChangePage}
                className="w-10 h-8 p-1 border-zinc-300 bg-blue-500 hover:bg-blue-600 border-[1px] rounded-md text-center text-white"
              >
                Ir
              </button>
            </div>

            <div className="w-fit flex flex-row items-center gap-2">
              <p>Por página</p>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="block appearance-none w-20 bg-white text-zinc-500 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none border-zinc-300 border-[1px] focus:border-[2px] focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  )
}
