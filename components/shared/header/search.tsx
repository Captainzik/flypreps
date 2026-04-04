import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { APP_NAME } from '@/lib/constants'

const categories = ['ARDMS', 'Sonography Canada', 'CAMRT', 'ARRT', 'CPD']

export default function Search() {
  return (
    <form
      action='/search'
      method='GET'
      className='flex h-10 w-full items-stretch rounded-md'
      role='search'
      aria-label='Site search'
    >
      <Select name='category' defaultValue='all'>
        <SelectTrigger className='h-full w-22 rounded-r-none rounded-l-md border-r bg-gray-100 text-black'>
          <SelectValue placeholder='All' />
        </SelectTrigger>
        <SelectContent position='popper'>
          <SelectItem value='all'>All</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        className='h-full flex-1 rounded-none border-x-0 bg-gray-100 text-base text-black'
        placeholder={`Search ${APP_NAME}`}
        name='q'
        type='search'
        autoComplete='off'
      />

      <button
        type='submit'
        className='h-full rounded-l-none rounded-r-md bg-primary px-3 text-primary-foreground'
        aria-label='Submit search'
      >
        <SearchIcon className='h-5 w-5' />
      </button>
    </form>
  )
}
