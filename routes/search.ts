import { Router, Request, Response } from "express";
import axios from "axios";
import {
  VHS_SERVICE_URL,
  DVD_SERVICE_URL,
  PROJECTOR_SERVICE_URL,
} from "../config";
const router: Router = Router();

/*
@TODO: extract the following typings into its own file
*/

type FilmSearchRequest = {
  currentPage: number;
  pageSize: number;
  sortField: "title" | "releaseYear";
  sortDirection: "ASC" | "DESC";
  excludeVHS: boolean;
  excludeDVD: boolean;
  excludeProjector: boolean;
  search: {
    title: string;
    releaseYear: number;
    director: string;
    distributor: string;
  };
};

type Film = {
  title: string;
  releaseYear: number;
  numberOfCopiesAvailable: number;
  director: string;
  distributor: string;
};

router.post("/", async (req: Request, res: Response) => {
  const {
    currentPage,
    pageSize,
    sortField,
    sortDirection,
    excludeVHS,
    excludeDVD,
    excludeProjector,
    search,
  }: FilmSearchRequest = req.body;

  try {
    /*
    @TODO: extract the VHS, DVD, and PROJECTOR service calls into a separate file and function.
    */
    const searchPromises = [];

    if (!excludeVHS) {
      searchPromises.push(axios.post<Film[]>(VHS_SERVICE_URL, { search }));
    }
    if (!excludeDVD) {
      searchPromises.push(axios.post<Film[]>(DVD_SERVICE_URL, { search }));
    }
    if (!excludeProjector) {
      searchPromises.push(
        axios.post<Film[]>(PROJECTOR_SERVICE_URL, { search })
      );
    }

    //@TODO: extract the aggregation, sorting, and pagination into utility functions in a separate file

    const results = await Promise.all(searchPromises);
    let aggregatedResults: Film[] = results.flatMap((result) => result.data);

    // Deduplicate by title and releaseYear
    const uniqueResults: Map<string, Film> = new Map();
    aggregatedResults.forEach((film) => {
      const key = `${film.title}-${film.releaseYear}`;
      if (!uniqueResults.has(key)) {
        uniqueResults.set(key, film);
      }
    });

    const dedupedResults = Array.from(uniqueResults.values());

    // Sort results
    dedupedResults.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];

      if (fieldA < fieldB) return sortDirection === "ASC" ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === "ASC" ? 1 : -1;
      return 0;
    });

    // Pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResults = dedupedResults.slice(
      startIndex,
      startIndex + pageSize
    );

    res.json(paginatedResults);
  } catch (error) {
    console.error("Error occurred during search:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
