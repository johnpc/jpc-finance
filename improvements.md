# Code Improvements Roadmap

## 🚨 Critical Priority

### Security Issues
- [ ] **Fix Function URL Authentication** (backend.ts)
  - Change `FunctionUrlAuthType.NONE` to `FunctionUrlAuthType.AWS_IAM`
  - Restrict CORS to specific frontend URL instead of `["*"]`
  - Add proper authentication headers
  - Location: `amplify/backend.ts` lines 78-82

- [ ] **Add Input Validation**
  - Replace `prompt()` calls with proper modals
  - Add validation for user inputs (category names, amounts)
  - Sanitize all user-provided data
  - Location: `BudgetTableCategoryRow.tsx` lines 24-36

### Error Handling
- [ ] **Add Error Boundaries**
  - Create `ErrorBoundary` component
  - Wrap main app sections
  - Add error fallback UI
  - Log errors to monitoring service

- [ ] **Add Global Error Handler**
  - Centralized error reporting
  - User-friendly error messages
  - Retry mechanisms for failed requests

## 🔥 High Priority

### Performance Optimization
- [ ] **Fix N+1 Query Problem** (useBudget.ts)
  - Fetch all transactions for month at once
  - Group by category in memory instead of sequential queries
  - Location: `src/hooks/useBudget.ts` lines 40-65
  - Estimated impact: 10-20x faster budget loading

- [ ] **Implement Proper Pagination**
  - Remove hardcoded `limit: 10000`
  - Create reusable pagination utility
  - Handle `nextToken` properly across all queries
  - Locations: `useBudget.ts`, `useTransactions.ts`

- [ ] **Add Request Deduplication**
  - Ensure React Query keys are consistent
  - Prevent duplicate API calls
  - Add request caching strategy

### User Experience
- [ ] **Add Loading States**
  - Show spinners during mutations
  - Disable buttons while processing
  - Add skeleton loaders for data fetching
  - Locations: `BudgetTableCategoryRow.tsx`, `CategoryDetail.tsx`

- [ ] **Add Optimistic Updates**
  - Update UI immediately on user action
  - Rollback on error
  - Improve perceived performance

- [ ] **Replace prompt() with Modals**
  - Create reusable modal components
  - Add proper form validation
  - Better UX for editing categories

## 📊 Medium Priority

### Code Quality
- [ ] **Fix Memory Leak in Subscriptions**
  - Use `useRef` to track subscription state
  - Prevent recreation on every user change
  - Location: `SubscriptionProvider.tsx`

- [ ] **Add Memoization**
  - Memoize expensive calculations in `BudgetTableCategoryRow`
  - Use `useMemo` for derived state
  - Use `useCallback` for event handlers
  - Location: `BudgetTableCategoryRow.tsx` lines 44-49

- [ ] **Extract Magic Numbers**
  - Create constants file for `CENTS_TO_DOLLARS = 100`
  - Document why amounts are stored as integers
  - Add type-safe currency utilities

- [ ] **Consistent Error Handling**
  - Add try/catch to all async operations
  - Standardize error response format
  - Add error logging

### Architecture
- [ ] **Add Stale-While-Revalidate**
  - Configure React Query `staleTime` and `cacheTime`
  - Improve offline experience
  - Reduce unnecessary refetches

- [ ] **Add Request Retry Logic**
  - Implement exponential backoff
  - Configure retry attempts per query type
  - Handle network failures gracefully

- [ ] **Reduce Prop Drilling**
  - Use context for `queryClient` and `client`
  - Create custom hooks for common patterns
  - Simplify component props

## 🎨 Low Priority

### Performance
- [ ] **Code Splitting**
  - Split by route
  - Lazy load heavy components (DND, charts)
  - Reduce initial bundle size (currently 984KB)

- [ ] **Optimize Bundle Size**
  - Remove unused MUI components
  - Use tree-shaking effectively
  - Consider lighter alternatives for heavy dependencies

- [ ] **Add Service Worker**
  - Cache static assets
  - Offline support
  - Background sync for mutations

### Developer Experience
- [ ] **Add Unit Tests**
  - Test custom hooks
  - Test utility functions
  - Test critical business logic

- [ ] **Add Integration Tests**
  - Test user flows
  - Test API interactions
  - Test error scenarios

- [ ] **Add E2E Tests**
  - Test critical user journeys
  - Test budget creation flow
  - Test transaction categorization

- [ ] **Improve Documentation**
  - Add JSDoc comments to complex functions
  - Document data flow and state management
  - Add architecture decision records (ADRs)
  - Document environment variables

- [ ] **Add Type Guards**
  - Validate API responses at runtime
  - Add Zod or similar for schema validation
  - Improve type safety at boundaries

## 📈 Future Enhancements

### Features
- [ ] **Add Undo/Redo**
  - Track mutation history
  - Allow users to undo actions
  - Improve error recovery

- [ ] **Add Bulk Operations**
  - Bulk categorize transactions
  - Bulk edit categories
  - Improve efficiency for power users

- [ ] **Add Data Export**
  - Export to CSV
  - Export to PDF reports
  - Backup functionality

### Monitoring
- [ ] **Add Analytics**
  - Track user behavior
  - Monitor performance metrics
  - Identify bottlenecks

- [ ] **Add Error Monitoring**
  - Integrate Sentry or similar
  - Track error rates
  - Alert on critical errors

- [ ] **Add Performance Monitoring**
  - Track Core Web Vitals
  - Monitor API response times
  - Identify slow queries

## 📝 Notes

### Recent Improvements (Completed)
- ✅ Fixed budget category pagination bug
- ✅ Added loading skeleton UI
- ✅ Removed all `any` types
- ✅ Removed all `eslint-disable` comments
- ✅ Restructured code for better organization
- ✅ Added build to pre-commit hook

### Technical Debt
- Consider migrating to React 19 when stable
- Evaluate Amplify Gen2 updates regularly
- Review and update dependencies quarterly
- Consider adding GraphQL subscriptions for real-time updates

### Performance Baseline
- Current bundle size: 984KB (gzipped: 294.82 kB)
- Target bundle size: <500KB (gzipped: <150 kB)
- Current load time: TBD (needs measurement)
- Target load time: <2s on 3G

---

**Last Updated**: 2026-01-08
**Next Review**: 2026-02-08
