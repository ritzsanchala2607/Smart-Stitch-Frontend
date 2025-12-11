// Manual mock for react-router-dom
const mockNavigate = jest.fn();
let mockParams = {};

module.exports = {
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/owner/add-worker',
    search: '',
    hash: '',
    state: null,
  }),
  useParams: () => mockParams,
  __setMockParams: (params) => {
    mockParams = params;
  },
  Link: ({ children, to, ...props }) => {
    return React.createElement('a', { href: to, ...props }, children);
  },
  Navigate: ({ to }) => {
    mockNavigate(to);
    return null;
  },
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: () => null,
};
