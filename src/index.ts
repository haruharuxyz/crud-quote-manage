import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define Quote type
type Quote = Record<{
    id: string;
    content: string;
    authorId: string;
    collectorId: string;
    collector: Principal; // only creator can update/delete his quote
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

// Define Quote's Author type
type Author = Record<{
    id: string;
    name: string; // name of the author
    birthYear: nat64; // year of birth of the author
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

// Define Collector type
type Collector = Record<{
    id: string;
    principal: Principal;
    collectorName: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

// Define AuthorPayload for creating/updating authorStorage
type AuthorPayload = Record<{
    name: string;
    birthYear: nat64;
}>

// Define CollectorPayload for creating/updating collectorStorage
type CollectorPayload = Record<{
    collectorName: string;
}>

// Define QuotePayload for creator to upload/update 
type QuotePayload = Record<{
    content: string;
    collectorId: string;
    authorId: string;
}>

// Create a new StableBTreeMap to store authors, collectors and quotes
const collectorStorage = new StableBTreeMap<string, Collector>(0, 44, 1024);
const authorStorage = new StableBTreeMap<string, Author>(1, 44, 1024);
const quoteStorage = new StableBTreeMap<string, Quote>(2, 44, 1024);

$query;
// Read all authors info
export function getAuthors(): Result<Vec<Author>, string> {
    try {
        return Result.Ok(authorStorage.values());
    } catch (error) {
        return Result.Err(`Failed to get authors: ${error}`);
    }
}

$query;
// Find author info by author ID
export function getAuthor(id: string): Result<Author, string> {
    // Suggestion 1: Consider adding type checking for the `id` parameter to ensure it's a string.
    if (typeof id !== 'string') {
        return Result.Err<Author, string>('id must be a string');
    }

    // Suggestion 2: Consider adding null or undefined check for the `id` parameter to prevent potential errors.
    if (id === null || id === undefined) {
        return Result.Err<Author, string>('id parameter is null or undefined');
    }
    try {
        return match(authorStorage.get(id), {
            Some: (author) => Result.Ok<Author, string>(author),
            None: () => Result.Err<Author, string>(`author with id=${id} not found`)
        });
    } catch (error) {
        return Result.Err(`Failed to get author with id: ${id}`);
    }
}

$query;
// Find all collectors info
export function getCollectors(): Result<Vec<Collector>, string> {
    try {
        return Result.Ok(collectorStorage.values());
    } catch (error) {
        return Result.Err(`An error occurred: ${error}`);
    }
}

$query;
// Find collector info by collector ID
export function getCollector(id: string): Result<Collector, string> {
    // Validate the input parameter 'id' to ensure it's a non-empty string
    if (id === '' || typeof id !== 'string') {
        return Result.Err<Collector, string>('Invalid collector ID');
    }
    try {
        return match(collectorStorage.get(id), {
            Some: (collector) => Result.Ok<Collector, string>(collector),
            None: () => Result.Err<Collector, string>(`collector with id=${id} not found`)
        });
    } catch (error) {
        return Result.Err<Collector, string>(`error retrieving collector with id=${id}: ${error}`);
    }
}

$query;
// Find all quotes info
export function getQuotes(): Result<Vec<Quote>, string> {
    try {
        return Result.Ok(quoteStorage.values());
    } catch (error) {
        return Result.Err(`An error occurred: ${error}`);
    }
}

$query;
// Find quote info by quote ID
export function getQuoteById(id: string): Result<Quote, string> {
    // Validate the input parameter 'id' to ensure it's a non-empty string
    if (id === '' || typeof id !== 'string') {
        return Result.Err<Quote, string>('Invalid Quote ID');
    }
    try {
        return match(quoteStorage.get(id), {
            Some: (quote) => Result.Ok<Quote, string>(quote),
            None: () => Result.Err<Quote, string>(`quote with id=${id} not found`)
        });
    } catch (error) {
        return Result.Err<Quote, string>(`error retrieving Quote with id=${id}: ${error}`);
    }
}

$query;
// Find all quotes collected by the current user
export function getQuotesByCurrentUser(): Result<Vec<Quote>, string> {
    try {
        const quotes = quoteStorage.values();
        const returnedQuotes: Quote[] = [];

        for (const quote of quotes) {
            if (quote.collector.toString() === ic.caller().toString()) {
                returnedQuotes.push(quote);
            }
        }

        return Result.Ok(returnedQuotes);
    } catch (error) {
        return Result.Err(`An error occurred while getting quotes by currentUser: ${error}`);
    }
}

$query;
// Find all quotes collected by collector id
export function getQuotesByCollectorId(collectorId: string): Result<Vec<Quote>, string> {
    if (collectorId === null || collectorId === undefined) {
        return Result.Err("collectorId is null or undefined");
    }
    try {
        const quotes = quoteStorage.values();
        const returnedQuotes: Quote[] = [];

        for (const quote of quotes) {
            if (quote.collectorId === collectorId) {
                returnedQuotes.push(quote);
            }
        }

        return Result.Ok(returnedQuotes);
    } catch (error) {
        return Result.Err(`An error occurred while fetching quotes by collectorId: ${collectorId}`);
    }
}

$query;
// Find all quotes by author ID
export function getQuotesByAuthorId(authorId: string): Result<Vec<Quote>, string> {
    if (authorId === null || authorId === undefined) {
        return Result.Err("authorId is null or undefined");
    }
    try {
        const quotes = quoteStorage.values();
        const returnedQuotes: Quote[] = [];

        for (const quote of quotes) {
            if (quote.authorId === authorId) {
                returnedQuotes.push(quote);
            }
        }

        return Result.Ok(returnedQuotes);
    } catch (error) {
        return Result.Err(`An error occurred while fetching quotes by authorId: ${authorId}`);
    }
}

$query;
// Find all quotes by author name
export function getQuotesByAuthorName(authorName: string): Result<Vec<Quote>, string> {
    // find authorId with author name
    const authors = authorStorage.values();
    let authorId: string = "";
    for (const author of authors) {
        if (author.name.toLowerCase() == authorName.toLowerCase()) {
            authorId = author.id;
            break;
        }
    }

    if (authorId == "") {
        return Result.Err<Vec<Quote>, string>(`Author with name=${authorName} not found`);
    }

    const quotes = quoteStorage.values();
    const returnedQuotes: Quote[] = [];

    for (const quote of quotes) {
        if (quote.authorId == authorId) {
            returnedQuotes.push(quote);
        }
    }

    return Result.Ok(returnedQuotes);
}

$update;
// User must register as collector to upload/update/delete quotes
export function registerCollector(payload: CollectorPayload): Result<Collector, string> {
    // Validate payload: Check if required fields in the payload are missing
    if (!payload.collectorName) {
        return Result.Err<Collector, string>('Missing or invalid fields in payload.');
    }

    const collector: Collector = {
        id: uuidv4(), // Generate a unique ID for the new collector
        createdAt: ic.time(), // Set the creation timestamp to the current time
        updatedAt: Opt.None, // Set the initial update timestamp as None
        principal: ic.caller(),
        collectorName: payload.collectorName
    };

    // revert if collector already registered
    const collectors = collectorStorage.values();
    for (const c of collectors) {
        if (c.principal.toString() == ic.caller().toString()) {
            return Result.Err<Collector, string>(`collector already registered`);
        }
    }
    try {
        collectorStorage.insert(collector.id, collector); // Store the collector in the collector storage
        return Result.Ok(collector);
    } catch (error) {
        return Result.Err<Collector, string>(`Error while inserting collector into collectorStorage: ${error}`);
    }
}

$update;
// Collector update his name
// Only collector can update his name
export function updateCollector(
    id: string,
    payload: CollectorPayload
): Result<Collector, string> {
    // validate the id parameter
    if (id === null || id === undefined) {
        return Result.Err("collectorId is null or undefined");
    }
    // Validate payload: Check if required fields in the payload are missing
    if (!payload.collectorName) {
        return Result.Err<Collector, string>('Missing or invalid fields in payload.');
    }
    return match(collectorStorage.get(id), {
        Some: (collector: Collector) => {
            // Confirm only collector can update his info
            if (ic.caller().toString() != collector.principal.toString()) {
                return Result.Err<Collector, string>(
                    `You are not authorized to update the collector info.`
                );
            }

            const updatedCollector: Collector = {
                ...collector,
                collectorName: payload.collectorName,
                updatedAt: Opt.Some(ic.time()), // Set the update timestamp to the current time
            };
            collectorStorage.insert(collector.id, updatedCollector); // Update the collector in the collector storage
            return Result.Ok<Collector, string>(updatedCollector);
        },
        None: () =>
            Result.Err<Collector, string>(
                `Couldn't update a collector with id=${id}. Collector not found.`
            ),
    });
}

// collector upload quote, failed if author not exist
$update;
export function uploadQuote(payload: QuotePayload): Result<Quote, string> {
    // Validate payload: Check if required fields in the payload are missing
    if (!payload.authorId || !payload.collectorId || !payload.content) {
        return Result.Err<Quote, string>('Missing or invalid fields in payload.');
    }
    const quote: Quote = {
        id: uuidv4(),
        content: payload.content,
        collectorId: payload.collectorId,
        authorId: payload.authorId,
        createdAt: ic.time(),
        updatedAt: Opt.None,
        collector: ic.caller(),
    };

    let authorId = "";
    const authors = authorStorage.values();
    for (const author of authors) {
        if (author.id == payload.authorId) {
            authorId = payload.authorId;
            break;
        }
    }

    if (authorId == "") {
        return Result.Err<Quote, string>(`author with id ${payload.authorId} not found`);
    }

    try {
        quoteStorage.insert(quote.id, quote);
        return Result.Ok(quote);
    } catch (error) {
        return Result.Err<Quote, string>(`Error while inserting quote into quoteStorage: ${error}`);
    }
}

// collector update quote, only the collector of the quote can update it
$update;
export function updateQuote(
    id: string,
    payload: QuotePayload
): Result<Quote, string> {
    return match(quoteStorage.get(id), {
        Some: (quote: Quote) => {
            // Confirm only collector can update his collected quote
            if (ic.caller().toString() !== quote.collector.toString()) {
                return Result.Err<Quote, string>(
                    `You are not authorized to update the quote content.`
                );
            }

            const updatedQuote: Quote = {
                ...quote,
                ...payload,
                updatedAt: Opt.Some(ic.time()), // Set the update timestamp to the current time
            };
            quoteStorage.insert(quote.id, updatedQuote); // Update the quote in the quote storage
            return Result.Ok<Quote, string>(updatedQuote);
        },
        None: () =>
            Result.Err<Quote, string>(
                `Couldn't update a quote with id=${id}. Quote not found.`
            ),
    });
}

// collector delete his quote, only the collector of the quote can delete it
$update;
export function deleteQuote(id: string): Result<string, string> {
    return match(quoteStorage.get(id), {
        Some: (quote: Quote) => {
            // Confirm only collector of the quote can call this function
            if (ic.caller().toString() !== quote.collector.toString()) {
                return Result.Err<string, string>(
                    `You are not authorized to delete the quote.`
                );
            }

            quoteStorage.remove(id); // Remove the quote from the quote storage
            return Result.Ok<string, string>(`Quote deleted successfully.`);
        },
        None: () => {
            return Result.Err<string, string>(
                `couldn't delete a quote with id=${id}. quote not found`
            );
        },
    });
}

// anyone can add new author
$update;
export function createAuthor(payload: AuthorPayload): Result<Author, string> {
    // Validate payload: Check if required fields in the payload are missing
    if (!payload.name || !payload.birthYear) {
        return Result.Err("Invalid payload: name and birthYear are required");
    }

    const author: Author = {
        id: uuidv4(),
        createdAt: ic.time(),
        updatedAt: Opt.None,
        name: payload.name,
        birthYear: payload.birthYear
    };

    try {
        authorStorage.insert(author.id, author); // Store the author in the author storage
        return Result.Ok(author);
    } catch (error) {
        return Result.Err(`Failed to create author: ${error}`);
    }
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    },
};