# Future Features Checklist

## UI/UX Improvements

### Navigation & Layout
- [x] **Home button** - Add navigation back to homepage from all pages
- [x] **Search functionality** - Implement search bar with filterable criteria:
  - [x] Search by name/payor
  - [x] Search by memo content
  - [ ] Search by date range
  - [ ] Search by amount
  - [x] Search by check number
  - [ ] Toggle between different search criteria

### Image Handling
- [ ] **Check image reframing** - Improve how check images are displayed in preview
- [ ] **Full image preview** - Click on check image to show full-size preview modal
- [ ] **Image optimization** - Ensure images load quickly and display properly

### Check Management
- [ ] **Custom check naming** - Ability to rename checks instead of showing "Check #2343"
- [ ] **Memo field importance** - Ensure memo field is properly extracted and displayed (contains property addresses)
- [ ] **AI handwritten check detection** - Automatically detect if check is filled out by hand (personal check) and flag for human review
- [ ] **Review workflow improvements**:
  - [ ] Itemize "needs review" status with specific reasons
  - [ ] Turn off review status once review is completed
  - [ ] Add review notes/comments

## Administrative Features

### Settings
- [ ] **Settings page** - User preferences and configuration
- [ ] **Account management** - User profile and settings
- [ ] **System configuration** - App-wide settings

### Billing & Payments
- [ ] **Billing page** - Subscription management and payment history
- [ ] **Usage tracking** - Monitor API usage and costs
- [ ] **Payment integration** - Stripe or similar payment processor

## Technical Enhancements

### Data Management
- [ ] **Export functionality** - Download check data as CSV/Excel
- [ ] **Bulk operations** - Select multiple checks for batch actions
- [ ] **Data validation** - Improved error handling and validation

### Performance
- [ ] **Pagination** - Handle large numbers of checks efficiently
- [ ] **Caching** - Optimize database queries and API responses
- [ ] **Loading states** - Better user feedback during operations

## Integration Features

### Email Integration
- [ ] **Power Automate integration** - Process checks from email
- [ ] **Webhook handling** - Accept check data from external sources
- [ ] **Email notifications** - Notify users of new check uploads

### Authentication & Security
- [ ] **User authentication** - Login/logout functionality (see `email_auth.md` for implementation guide)
- [ ] **Role-based access** - Different permissions for different users
- [ ] **Data encryption** - Secure storage of sensitive information

## Priority Levels

### High Priority
1. [x] Home button
2. [x] Search functionality
3. [ ] Memo field importance
4. [ ] AI handwritten check detection
5. [ ] Review workflow improvements
6. [ ] Full image preview

### Medium Priority
1. Custom check naming
2. Settings page
3. Image reframing
4. Export functionality

### Low Priority
1. Billing page
2. Bulk operations
3. Email integration
4. Advanced authentication 