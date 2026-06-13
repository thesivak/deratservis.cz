type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
};

const pagesHost = "deratservis-cz.pages.dev";
const canonicalHost = "deratservis.cz";

export const onRequest = async ({ request, next }: PagesContext) => {
  const url = new URL(request.url);

  if (url.hostname === pagesHost || url.hostname.endsWith(`.${pagesHost}`)) {
    url.protocol = "https:";
    url.hostname = canonicalHost;
    return Response.redirect(url.toString(), 301);
  }

  return next();
};
