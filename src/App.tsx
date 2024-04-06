import { faker } from '@faker-js/faker'
import { useMemo, useState } from 'react'
import Table, { Column } from './components/table'

type Person = {
  name: string
  age: number
}

function makeData(quantity: number): Person[] {
  const data: Person[] = []

  for (let i = 0; i < quantity; i++) {
    data.push({
      name: faker.person.firstName(),
      age: faker.number.int({ min: 15, max: 80 }),
    })
  }

  return data
}

export default function App() {
  const [data] = useState(makeData(55))
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(0)

  const options = [
    { id: 'idx', text: 'Índice' },
    { id: 'firstName', text: 'Primeiro Nome' },
    { id: 'age', text: 'Idade' },
    { id: 'visits', text: 'Visitas' },
    { id: 'status', text: 'Status' },
    { id: 'progress', text: 'Progresso' },
  ]

  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    options.map((p) => p.id),
  )

  const columns: Column<Person>[] = useMemo(() => {
    const data = [
      {
        accessorFn: (_, idx) => idx + 1,
        sortingFn: 'alphanumeric',
        cell: (info) => info.getValue(),
        header: 'Índice',
        id: 'idx',
        size: 150,
      },
      {
        accessorKey: 'name',
        cell: (info) => info.getValue(),
        sortingFn: 'alphanumeric',
        header: () => <span>Primeiro Nome</span>,
        id: 'firstName',
        size: 150,
      },
      {
        accessorFn: (row) => row.name,
        sortingFn: 'alphanumeric',
        cell: (info) => info.getValue(),
        header: () => <span>Último Nome</span>,
        id: 'lastName',
        size: 150,
      },
      {
        accessorKey: 'age',
        sortingFn: 'alphanumeric',
        header: () => 'Idade',
        id: 'age',
        size: 120,
      },
      {
        accessorFn: (info) => info.name,
        sortingFn: 'alphanumeric',
        header: () => <span>Visitas</span>,
        id: 'visits',
        size: 120,
      },
      {
        accessorFn: (info) => info.name,
        sortingFn: 'alphanumeric',
        header: 'Status',
        id: 'status',
        size: 150,
      },
      {
        accessorFn: (info) => info.name,
        sortingFn: 'alphanumeric',
        header: 'Progresso',
        id: 'progress',
        size: 180,
      },
    ] satisfies Column<Person>[]

    return data.filter((item) =>
      selectedOptions.find((option) => option === item.id),
    )
  }, [selectedOptions])

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!),
  )

  async function prevPage() {
    setPage((prev) => prev - 1)
  }

  async function nextPage() {
    setPage((prev) => prev + 1)
  }

  const handleOptionChange = (id: string) => {
    if (selectedOptions.includes(id)) {
      setSelectedOptions(selectedOptions.filter((optionId) => optionId !== id))
    } else {
      setSelectedOptions([...selectedOptions, id])
    }
  }

  return (
    <div className="p-20 w-full flex flex-col gap-10 items-center">
      <h1 className="font-bold text-3xl">Tabela com colunas reorganizáveis</h1>

      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <div key={option.id} className="flex items-center border-b">
            <input
              type="checkbox"
              id={String(option.id)}
              value={option.id}
              checked={selectedOptions.includes(option.id)}
              onChange={() => handleOptionChange(option.id)}
              className="mr-2"
            />
            <label htmlFor={String(option.id)}>{option.text}</label>
          </div>
        ))}
      </div>

      <Table
        columnOrder={columnOrder}
        setColumnOrder={setColumnOrder}
        columns={columns}
        data={data}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        prevPage={prevPage}
        nextPage={nextPage}
      />
    </div>
  )
}
