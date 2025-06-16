-- AlterTable
ALTER TABLE `Book` MODIFY `categories` ENUM('biographiesmemoirs', 'fiction', 'nonfiction', 'biography', 'selfhelp', 'history', 'fantasy', 'science', 'romance', 'thriller', 'mystery', 'poetry', 'children', 'youngadult', 'health', 'religion', 'business', 'education', 'travel') NOT NULL;
