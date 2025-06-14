import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useQuizDashboardFilters } from '../hooks/use-quiz-dashboard-filters';
import { cn } from '@/lib/utils';

type IQuizPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export const QuizPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: IQuizPaginationProps) => {
  const { handlePageChange, isPending } = useQuizDashboardFilters();

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between transition-opacity',
        isPending && 'opacity-50',
      )}
    >
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1 && !isPending) {
                  handlePageChange(currentPage - 1);
                }
              }}
              className={cn(
                currentPage === 1 || isPending
                  ? 'pointer-events-none opacity-50'
                  : '',
              )}
            />
          </PaginationItem>

          {getPageNumbers().map((pageNum, index) => (
            <PaginationItem key={index}>
              {pageNum === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof pageNum === 'number' && !isPending) {
                      handlePageChange(pageNum);
                    }
                  }}
                  isActive={pageNum === currentPage}
                  className={cn(isPending && 'pointer-events-none opacity-50')}
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages && !isPending) {
                  handlePageChange(currentPage + 1);
                }
              }}
              className={cn(
                currentPage === totalPages || isPending
                  ? 'pointer-events-none opacity-50'
                  : '',
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
